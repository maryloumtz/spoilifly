import { promises as fs } from "node:fs";
import path from "node:path";
import type { DatabaseSchema } from "@/models/domain";
import { seedDatabase } from "@/services/server/seed";

const DB_PATH = path.join(process.cwd(), "data", "spoilifly-db.json");

async function ensureDatabaseFile(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(seedDatabase, null, 2), "utf8");
  }
}

function mergeById<T extends { id: string }>(seedItems: T[], existingItems: T[] | undefined): T[] {
  const map = new Map<string, T>();
  seedItems.forEach((item) => map.set(item.id, item));
  (existingItems ?? []).forEach((item) => map.set(item.id, item));
  return [...map.values()];
}

function mergeProfiles(seedItems: DatabaseSchema["profiles"], existingItems: DatabaseSchema["profiles"] | undefined) {
  const map = new Map<string, DatabaseSchema["profiles"][number]>();
  seedItems.forEach((item) => map.set(item.userId, item));
  (existingItems ?? []).forEach((item) => map.set(item.userId, item));
  return [...map.values()];
}

function normalizeSeededWorkCovers(works: DatabaseSchema["works"]) {
  const coverByWorkId = new Map(seedDatabase.works.map((work) => [work.id, work.coverImage]));
  return works.map((work) => {
    const seededCover = coverByWorkId.get(work.id);
    if (!seededCover) {
      return work;
    }

    if (work.coverImage.startsWith("https://images.unsplash.com")) {
      return { ...work, coverImage: seededCover };
    }

    return work;
  });
}

export async function readDatabase(): Promise<DatabaseSchema> {
  await ensureDatabaseFile();
  const content = await fs.readFile(DB_PATH, "utf8");
  const parsed = JSON.parse(content) as Partial<DatabaseSchema>;
  return {
    users: mergeById(seedDatabase.users, parsed.users),
    profiles: mergeProfiles(seedDatabase.profiles, parsed.profiles),
    works: normalizeSeededWorkCovers(mergeById(seedDatabase.works, parsed.works)),
    spoilers: mergeById(seedDatabase.spoilers, parsed.spoilers),
    packs: mergeById(seedDatabase.packs, parsed.packs),
    purchases: parsed.purchases ?? [],
    entitlements: parsed.entitlements ?? [],
    media: mergeById(seedDatabase.media, parsed.media),
    categories: mergeById(seedDatabase.categories, parsed.categories),
    tags: mergeById(seedDatabase.tags, parsed.tags),
    checkoutSessions: parsed.checkoutSessions ?? [],
    walletEntries: mergeById(seedDatabase.walletEntries, parsed.walletEntries),
    conversations: mergeById(seedDatabase.conversations, parsed.conversations),
    messages: mergeById(seedDatabase.messages, parsed.messages),
    meetings: mergeById(seedDatabase.meetings, parsed.meetings),
    meetingAttendees: mergeById(seedDatabase.meetingAttendees, parsed.meetingAttendees),
  };
}

export async function writeDatabase(db: DatabaseSchema): Promise<void> {
  await ensureDatabaseFile();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function mutateDatabase<T>(mutator: (db: DatabaseSchema) => T): Promise<T> {
  const db = await readDatabase();
  const result = mutator(db);
  await writeDatabase(db);
  return result;
}
