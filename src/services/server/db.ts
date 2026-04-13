import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import type { DatabaseSchema } from "@/models/domain";
import { seedDatabase } from "@/services/server/seed";

const DB_PATH = path.join(process.cwd(), "data", "spoilifly-db.json");
const APP_STATE_ID = "main";
const APP_STATE_TABLE = "app_state";

let pool: Pool | null = null;
let postgresReadyPromise: Promise<void> | null = null;

function getConnectionString(): string | null {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || null;
}

function getSanitizedConnectionString(): string | null {
  const connectionString = getConnectionString();
  if (!connectionString) {
    return null;
  }

  const url = new URL(connectionString);

  // pg drops explicit ssl options when sslmode/sslcert/... are present in the URL.
  url.searchParams.delete("sslmode");
  url.searchParams.delete("sslcert");
  url.searchParams.delete("sslkey");
  url.searchParams.delete("sslrootcert");
  url.searchParams.delete("uselibpqcompat");

  return url.toString();
}

function isPostgresEnabled(): boolean {
  return Boolean(getConnectionString());
}

function isReadOnlyDeployment(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function assertWritableLocalFallback(): void {
  if (isReadOnlyDeployment() && !isPostgresEnabled()) {
    throw new Error(
      "Base de donnees non configuree en production. Definis DATABASE_URL ou POSTGRES_URL avec ta connexion Postgres Supabase dans Vercel.",
    );
  }
}

function getPool(): Pool {
  if (!pool) {
    const connectionString = getSanitizedConnectionString();
    if (!connectionString) {
      throw new Error("DATABASE_URL ou POSTGRES_URL est requis pour utiliser Postgres.");
    }

    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : {
            rejectUnauthorized: false,
          },
    });
  }

  return pool;
}

function cloneDb<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

function normalizeDatabase(parsed: Partial<DatabaseSchema>): DatabaseSchema {
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

async function readLocalBootstrapData(): Promise<DatabaseSchema> {
  try {
    const content = await fs.readFile(DB_PATH, "utf8");
    return normalizeDatabase(JSON.parse(content) as Partial<DatabaseSchema>);
  } catch {
    return normalizeDatabase(seedDatabase);
  }
}

async function ensureLocalDatabaseFile(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    const initialData = await readLocalBootstrapData();
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
  }
}

async function ensurePostgresReady(): Promise<void> {
  if (!postgresReadyPromise) {
    postgresReadyPromise = (async () => {
      const client = await getPool().connect();

      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS ${APP_STATE_TABLE} (
            id TEXT PRIMARY KEY,
            payload JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);

        const existing = await client.query<{ id: string }>(`SELECT id FROM ${APP_STATE_TABLE} WHERE id = $1`, [APP_STATE_ID]);
        if (existing.rowCount === 0) {
          const bootstrapData = await readLocalBootstrapData();
          await client.query(
            `INSERT INTO ${APP_STATE_TABLE} (id, payload, updated_at) VALUES ($1, $2::jsonb, NOW())`,
            [APP_STATE_ID, JSON.stringify(bootstrapData)],
          );
        }
      } finally {
        client.release();
      }
    })().catch((error) => {
      postgresReadyPromise = null;
      throw error;
    });
  }

  await postgresReadyPromise;
}

async function readPostgresDatabase(): Promise<DatabaseSchema> {
  await ensurePostgresReady();
  const result = await getPool().query<{ payload: DatabaseSchema }>(
    `SELECT payload FROM ${APP_STATE_TABLE} WHERE id = $1`,
    [APP_STATE_ID],
  );

  if (result.rowCount === 0) {
    throw new Error("Etat applicatif Postgres introuvable.");
  }

  return normalizeDatabase(result.rows[0].payload);
}

async function writePostgresDatabase(db: DatabaseSchema): Promise<void> {
  await ensurePostgresReady();
  await getPool().query(
    `UPDATE ${APP_STATE_TABLE} SET payload = $2::jsonb, updated_at = NOW() WHERE id = $1`,
    [APP_STATE_ID, JSON.stringify(db)],
  );
}

async function readFileDatabase(): Promise<DatabaseSchema> {
  assertWritableLocalFallback();
  await ensureLocalDatabaseFile();
  const content = await fs.readFile(DB_PATH, "utf8");
  return normalizeDatabase(JSON.parse(content) as Partial<DatabaseSchema>);
}

async function writeFileDatabase(db: DatabaseSchema): Promise<void> {
  assertWritableLocalFallback();
  await ensureLocalDatabaseFile();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function readDatabase(): Promise<DatabaseSchema> {
  return isPostgresEnabled() ? readPostgresDatabase() : readFileDatabase();
}

export async function writeDatabase(db: DatabaseSchema): Promise<void> {
  if (isPostgresEnabled()) {
    await writePostgresDatabase(db);
    return;
  }

  await writeFileDatabase(db);
}

export async function mutateDatabase<T>(mutator: (db: DatabaseSchema) => T): Promise<T> {
  const db = cloneDb(await readDatabase());
  const result = mutator(db);
  await writeDatabase(db);
  return result;
}
