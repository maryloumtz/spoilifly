import type { Media, Pack, SpoilItem, Work } from "@/models/domain";
import type { PackInput, SpoilerInput, WorkInput } from "@/models/forms";
import { mutateDatabase } from "@/services/server/db";
import { createId, nowIso } from "@/services/server/utils";
import { validatePack, validateSpoiler, validateWork } from "@/services/server/validators";

export async function createWork(input: WorkInput) {
  const validation = validateWork(input);
  if (validation.errors) {
    return { error: validation.errors };
  }

  const payload = validation.data!;

  return mutateDatabase((db) => {
    if (db.works.some((entry) => entry.slug === payload.slug)) {
      return { error: { slug: "Ce slug existe déjà." } };
    }

    const now = nowIso();
    const work: Work = {
      id: createId("work"),
      createdAt: now,
      updatedAt: now,
      ...payload,
      type: payload.type as Work["type"],
    };
    db.works.push(work);
    return { work };
  });
}

export async function updateWork(workId: string, input: WorkInput) {
  const validation = validateWork(input);
  if (validation.errors) {
    return { error: validation.errors };
  }

  const payload = validation.data!;

  return mutateDatabase((db) => {
    const work = db.works.find((entry) => entry.id === workId);
    if (!work) {
      return { error: { title: "Oeuvre introuvable." } };
    }

    const slugTaken = db.works.some((entry) => entry.slug === payload.slug && entry.id !== workId);
    if (slugTaken) {
      return { error: { slug: "Ce slug existe déjà." } };
    }

    Object.assign(work, payload, { type: payload.type as Work["type"], updatedAt: nowIso() });
    return { work };
  });
}

export async function deleteWork(workId: string) {
  return mutateDatabase((db) => {
    db.works = db.works.filter((entry) => entry.id !== workId);
    db.spoilers = db.spoilers.filter((entry) => entry.workId !== workId);
    db.packs = db.packs.filter((entry) => entry.workId !== workId);
    db.media = db.media.filter((entry) => !(entry.ownerType === "work" && entry.ownerId === workId));
    return { ok: true };
  });
}

export async function createSpoiler(input: SpoilerInput) {
  const validation = validateSpoiler(input);
  if (validation.errors) {
    return { error: validation.errors };
  }

  const payload = validation.data!;
  return mutateDatabase((db) => {
    const work = db.works.find((entry) => entry.id === payload.workId);
    if (!work) {
      return { error: { workId: "Oeuvre introuvable." } };
    }

    const now = nowIso();
    const spoiler: SpoilItem = {
      id: createId("spoil"),
      createdAt: now,
      updatedAt: now,
      ...payload,
      level: payload.level as SpoilItem["level"],
      creatorUserId: "user-admin",
      status: "published",
    };
    db.spoilers.push(spoiler);
    return { spoiler };
  });
}

export async function updateSpoiler(spoilerId: string, input: SpoilerInput) {
  const validation = validateSpoiler(input);
  if (validation.errors) {
    return { error: validation.errors };
  }

  const payload = validation.data!;
  return mutateDatabase((db) => {
    const spoiler = db.spoilers.find((entry) => entry.id === spoilerId);
    if (!spoiler) {
      return { error: { title: "Spoiler introuvable." } };
    }

    Object.assign(spoiler, payload, { level: payload.level as SpoilItem["level"], updatedAt: nowIso() });
    return { spoiler };
  });
}

export async function deleteSpoiler(spoilerId: string) {
  return mutateDatabase((db) => {
    db.spoilers = db.spoilers.filter((entry) => entry.id !== spoilerId);
    db.packs.forEach((pack) => {
      pack.spoilIds = pack.spoilIds.filter((entry) => entry !== spoilerId);
    });
    db.media = db.media.filter((entry) => !(entry.ownerType === "spoil" && entry.ownerId === spoilerId));
    return { ok: true };
  });
}

export async function createPack(input: PackInput) {
  const validation = validatePack(input);
  if (validation.errors) {
    return { error: validation.errors };
  }

  const payload = validation.data!;
  return mutateDatabase((db) => {
    const work = db.works.find((entry) => entry.id === payload.workId);
    if (!work) {
      return { error: { workId: "Oeuvre introuvable." } };
    }

    const now = nowIso();
    const pack: Pack = {
      id: createId("pack"),
      createdAt: now,
      updatedAt: now,
      ...payload,
    };
    db.packs.push(pack);
    return { pack };
  });
}

export async function updatePack(packId: string, input: PackInput) {
  const validation = validatePack(input);
  if (validation.errors) {
    return { error: validation.errors };
  }

  const payload = validation.data!;
  return mutateDatabase((db) => {
    const pack = db.packs.find((entry) => entry.id === packId);
    if (!pack) {
      return { error: { title: "Pack introuvable." } };
    }

    Object.assign(pack, payload, { updatedAt: nowIso() });
    return { pack };
  });
}

export async function deletePack(packId: string) {
  return mutateDatabase((db) => {
    db.packs = db.packs.filter((entry) => entry.id !== packId);
    return { ok: true };
  });
}

export async function createMedia(input: Omit<Media, "id" | "createdAt">) {
  return mutateDatabase((db) => {
    const media: Media = {
      id: createId("media"),
      createdAt: nowIso(),
      ...input,
    };
    db.media.push(media);
    return { media };
  });
}
