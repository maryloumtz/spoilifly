import type {
  Category,
  Entitlement,
  Media,
  Pack,
  SessionUser,
  SpoilItem,
  Tag,
  Work,
} from "@/models/domain";
import type {
  HomePayload,
  HomeSpoilerCard,
  LibraryEntry,
  PackSummary,
  PurchaseHistoryItem,
  SpoilerDetailView,
  SpoilerSummary,
  WorkCardView,
  WorkDetailView,
  WorkFilters,
} from "@/models/view";
import { readDatabase } from "@/services/server/db";

type Database = Awaited<ReturnType<typeof readDatabase>>;

function hasSpoilerAccess(entitlements: Entitlement[], spoilId: string, workId: string): boolean {
  return entitlements.some((entry) => entry.userId && entry.workId === workId && (entry.spoilId === spoilId || entry.spoilId === null));
}

function isPublishedSpoiler(spoiler: SpoilItem): boolean {
  return spoiler.status === "published";
}

function getUserEntitlements(db: Database, sessionUser: SessionUser | null): Entitlement[] {
  return sessionUser ? db.entitlements.filter((entry) => entry.userId === sessionUser.id) : [];
}

function getTags(tags: Tag[], ids: string[]): Tag[] {
  return tags.filter((tag) => ids.includes(tag.id));
}

function getMedia(media: Media[], ownerType: "work" | "spoil", ownerId: string): Media[] {
  return media.filter((entry) => entry.ownerType === ownerType && entry.ownerId === ownerId);
}

function toPackSummary(pack: Pack | undefined, entitlements: Entitlement[], workId: string): PackSummary | null {
  if (!pack) {
    return null;
  }

  return {
    id: pack.id,
    title: pack.title,
    description: pack.description,
    priceCents: pack.priceCents,
    spoilCount: pack.spoilIds.length,
    isOwned: entitlements.some((entry) => entry.workId === workId && entry.packId === pack.id),
  };
}

function toWorkCard(
  work: Work,
  spoilers: SpoilItem[],
  categories: Category[],
  tags: Tag[],
  packs: Pack[],
  entitlements: Entitlement[],
): WorkCardView {
  const workSpoilers = spoilers.filter((entry) => entry.workId === work.id && isPublishedSpoiler(entry));
  const pack = packs.find((entry) => entry.workId === work.id);
  return {
    id: work.id,
    slug: work.slug,
    title: work.title,
    description: work.description,
    type: work.type,
    coverImage: work.coverImage,
    releaseYear: work.releaseYear,
    category: categories.find((category) => category.id === work.categoryId) ?? null,
    tags: getTags(tags, work.tagIds),
    lowestPriceCents: Math.min(...workSpoilers.map((entry) => entry.priceCents), pack?.priceCents ?? Number.MAX_SAFE_INTEGER),
    spoilerCount: workSpoilers.length,
    pack: toPackSummary(pack, entitlements, work.id),
  };
}

function filterWorks(works: WorkCardView[], filters: WorkFilters, spoilers: SpoilItem[]): WorkCardView[] {
  return works
    .filter((work) => {
      const matchesSearch =
        !filters.search ||
        `${work.title} ${work.description}`.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = filters.type === "all" || work.type === filters.type;
      const matchesCategory = !filters.category || work.category?.slug === filters.category;
      const matchesTag = !filters.tag || work.tags.some((tag) => tag.slug === filters.tag);
      const relatedSpoilers = spoilers.filter((entry) => entry.workId === work.id && isPublishedSpoiler(entry));
      const matchesLevel =
        filters.level === "all" || relatedSpoilers.some((entry) => entry.level === filters.level);
      return matchesSearch && matchesType && matchesCategory && matchesTag && matchesLevel;
    })
    .sort((left, right) => {
      switch (filters.sort) {
        case "recent":
          return right.releaseYear - left.releaseYear;
        case "price_asc":
          return left.lowestPriceCents - right.lowestPriceCents;
        case "price_desc":
          return right.lowestPriceCents - left.lowestPriceCents;
        case "title":
          return left.title.localeCompare(right.title, "fr");
        default:
          return right.spoilerCount - left.spoilerCount;
      }
    });
}

function toSpoilerSummary(spoiler: SpoilItem, tags: Tag[], entitlements: Entitlement[]): SpoilerSummary {
  return {
    id: spoiler.id,
    title: spoiler.title,
    teaser: spoiler.teaser,
    level: spoiler.level,
    priceCents: spoiler.priceCents,
    isOwned: hasSpoilerAccess(entitlements, spoiler.id, spoiler.workId),
    tags: getTags(tags, spoiler.tagIds),
  };
}

function getLatestSpoilerTimestamp(spoilers: SpoilItem[], workId: string, allowedSpoilerIds: Set<string>): string {
  return spoilers
    .filter((entry) => entry.workId === workId && allowedSpoilerIds.has(entry.id))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0]?.createdAt ?? "";
}

function buildCatalogData(db: Database, filters: WorkFilters, sessionUser: SessionUser | null) {
  const entitlements = getUserEntitlements(db, sessionUser);
  const works = db.works.map((work) => toWorkCard(work, db.spoilers, db.categories, db.tags, db.packs, entitlements));

  return {
    works: filterWorks(works, filters, db.spoilers),
    categories: db.categories,
    tags: db.tags,
    entitlements,
  };
}

export async function getCatalogData(filters: WorkFilters, sessionUser: SessionUser | null) {
  const db = await readDatabase();
  const { works, categories, tags } = buildCatalogData(db, filters, sessionUser);

  return {
    works,
    categories,
    tags,
  };
}

export async function getHomeData(sessionUser: SessionUser | null) {
  const db = await readDatabase();
  const data = buildCatalogData(
    db,
    { search: "", type: "all", category: "", tag: "", level: "all", sort: "popular" },
    sessionUser,
  );
  const latestSpoilers: HomeSpoilerCard[] = db.spoilers
    .filter(isPublishedSpoiler)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 4)
    .map((entry) => {
      const work = db.works.find((workItem) => workItem.id === entry.workId)!;
      return {
        id: entry.id,
        title: entry.title,
        teaser: entry.teaser,
        level: entry.level,
        priceCents: entry.priceCents,
        isOwned: hasSpoilerAccess(data.entitlements, entry.id, entry.workId),
        tags: getTags(db.tags, entry.tagIds),
        createdAt: entry.createdAt,
        work: {
          id: work.id,
          slug: work.slug,
          title: work.title,
          coverImage: work.coverImage,
        },
      };
    });

  return {
    featured: data.works.slice(0, 3),
    latest: [...data.works].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 4),
    latestSpoilers,
    categories: data.categories,
  } satisfies HomePayload;
}

export async function getWorkDetail(slug: string, sessionUser: SessionUser | null): Promise<WorkDetailView | null> {
  const db = await readDatabase();
  const work = db.works.find((entry) => entry.slug === slug);

  if (!work) {
    return null;
  }

  const entitlements = getUserEntitlements(db, sessionUser);
  const workSpoilers = db.spoilers.filter((entry) => entry.workId === work.id);
  const spoilerSummaries = workSpoilers.filter(isPublishedSpoiler).map((spoil) => toSpoilerSummary(spoil, db.tags, entitlements));

  return {
    ...toWorkCard(work, db.spoilers, db.categories, db.tags, db.packs, entitlements),
    spoilZoneLabel: work.spoilZoneLabel,
    spoilZoneX: work.spoilZoneX,
    spoilZoneY: work.spoilZoneY,
    spoilers: spoilerSummaries,
    media: getMedia(db.media, "work", work.id),
  };
}

export async function getSpoilerDetail(id: string, sessionUser: SessionUser | null): Promise<SpoilerDetailView | null> {
  const db = await readDatabase();
  const spoiler = db.spoilers.find((entry) => entry.id === id);

  if (!spoiler) {
    return null;
  }

  if (spoiler.status !== "published" && sessionUser?.id !== spoiler.creatorUserId && sessionUser?.role !== "admin") {
    return null;
  }

  const work = db.works.find((entry) => entry.id === spoiler.workId);
  if (!work) {
    return null;
  }

  const entitlements = getUserEntitlements(db, sessionUser);
  const isOwned = hasSpoilerAccess(entitlements, spoiler.id, work.id);

  return {
    id: spoiler.id,
    title: spoiler.title,
    teaser: spoiler.teaser,
    level: spoiler.level,
    priceCents: spoiler.priceCents,
    work: {
      id: work.id,
      slug: work.slug,
      title: work.title,
      coverImage: work.coverImage,
    },
    tags: getTags(db.tags, spoiler.tagIds),
    media: [
      ...getMedia(db.media, "spoil", spoiler.id),
      ...getMedia(db.media, "work", work.id).slice(0, 1),
    ],
    premiumContent: isOwned ? spoiler.premiumContent : null,
    isOwned,
    pack: toPackSummary(db.packs.find((entry) => entry.workId === work.id), entitlements, work.id),
  };
}

export async function getLibrary(userId: string): Promise<LibraryEntry[]> {
  const db = await readDatabase();
  const entitlements = db.entitlements.filter((entry) => entry.userId === userId);
  const creatorWorkIds = db.spoilers.filter((entry) => entry.creatorUserId === userId).map((entry) => entry.workId);
  const ownedWorkIds = [...new Set([...entitlements.map((entry) => entry.workId), ...creatorWorkIds])];

  return ownedWorkIds.map((workId) => {
    const work = db.works.find((entry) => entry.id === workId)!;
    const workSpoilers = db.spoilers.filter(
      (entry) =>
        entry.workId === workId &&
        ((isPublishedSpoiler(entry) && hasSpoilerAccess(entitlements, entry.id, workId)) || entry.creatorUserId === userId),
    ).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    const spoilerIds = new Set(workSpoilers.map((entry) => entry.id));

    return {
      work: toWorkCard(work, db.spoilers, db.categories, db.tags, db.packs, entitlements),
      spoilers: workSpoilers.map((entry) => ({ ...toSpoilerSummary(entry, db.tags, entitlements), isOwned: true })),
      pack: toPackSummary(db.packs.find((entry) => entry.workId === workId), entitlements, workId),
      latestSpoilerCreatedAt: getLatestSpoilerTimestamp(db.spoilers, workId, spoilerIds),
    };
  }).sort((left, right) => {
    return right.latestSpoilerCreatedAt.localeCompare(left.latestSpoilerCreatedAt);
  }).map((entry) => ({
    work: entry.work,
    spoilers: entry.spoilers,
    pack: entry.pack,
  }));
}

export async function getPurchaseHistory(userId: string): Promise<PurchaseHistoryItem[]> {
  const db = await readDatabase();

  return db.purchases
    .filter((entry) => entry.userId === userId)
    .map((purchase) => {
      const spoiler = db.spoilers.find((entry) => entry.id === purchase.productId);
      const pack = db.packs.find((entry) => entry.id === purchase.productId);
      const workId = spoiler?.workId ?? pack?.workId ?? "";
      const work = db.works.find((entry) => entry.id === workId);

      return {
        id: purchase.id,
        productType: purchase.productType,
        productTitle: spoiler?.title ?? pack?.title ?? "Produit inconnu",
        workTitle: work?.title ?? "Oeuvre inconnue",
        amountCents: purchase.amountCents,
        status: purchase.status,
        createdAt: purchase.createdAt,
      };
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getAdminReferenceData() {
  const db = await readDatabase();
  return {
    works: db.works,
    spoilers: db.spoilers,
    packs: db.packs,
    categories: db.categories,
    tags: db.tags,
    media: db.media,
  };
}
