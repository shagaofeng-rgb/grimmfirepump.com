import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";
import { isWithinReportingDateRange } from "./admin-listing";

const runtimeDir = process.env.VERCEL
  ? path.join("/tmp", "grimm-pump-runtime")
  : path.join(process.cwd(), "data", "runtime");

let schemaReady: Promise<void> | null = null;

function getDatabaseUrl() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
}

function getSql() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl && process.env.VERCEL_ENV === "production") {
    throw new Error("Production database connection is not configured.");
  }
  return databaseUrl ? neon(databaseUrl) : null;
}

function mustUseDatabase() {
  return Boolean(getDatabaseUrl()) && (process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL));
}

function handleDatabaseFailure(message: string, error: unknown): never | void {
  if (mustUseDatabase()) {
    console.error(message, { code: (error as { code?: string } | null)?.code || "database_error" });
    throw new Error(message);
  }
  console.warn(`${message} Falling back to the local development store.`, error);
}

async function ensureSchema() {
  if (process.env.VERCEL_ENV === "production") return;
  const sql = getSql();
  if (!sql) return;
  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS lead_store (
        store_name TEXT NOT NULL,
        id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        payload JSONB NOT NULL,
        PRIMARY KEY (store_name, id)
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_lead_store_name_created
      ON lead_store (store_name, created_at DESC)
    `;
  })();
  try {
    await schemaReady;
  } catch (error) {
    // A transient Neon connection failure must not leave a rejected promise
    // cached for the lifetime of the server or build worker.
    schemaReady = null;
    throw error;
  }
}

async function withDatabaseReadRetry<T>(operation: () => Promise<T>, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      schemaReady = null;
      if (attempt + 1 < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
      }
    }
  }
  throw lastError;
}

async function ensureRuntimeDir() {
  await fs.mkdir(runtimeDir, { recursive: true });
}

async function readLocalStore<T>(fileName: string, fallback: T): Promise<T> {
  const filePath = path.join(runtimeDir, fileName);
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return fallback;
  }
}

const localWrites = new Map<string, Promise<unknown>>();

function withLocalWrite<T>(fileName: string, operation: () => Promise<T>): Promise<T> {
  const next = (localWrites.get(fileName) ?? Promise.resolve()).catch(() => undefined).then(operation);
  localWrites.set(fileName, next);
  return next.finally(() => {
    if (localWrites.get(fileName) === next) localWrites.delete(fileName);
  });
}

async function replaceLocalStore<T>(fileName: string, data: T) {
  await ensureRuntimeDir();
  const filePath = path.join(runtimeDir, fileName);
  const temp = `${filePath}.${crypto.randomUUID()}.tmp`;
  try {
    await fs.writeFile(temp, JSON.stringify(data, null, 2), { mode: 0o600 });
    await fs.rename(temp, filePath);
  } finally {
    await fs.rm(temp, { force: true });
  }
}

export async function readStore<T>(fileName: string, fallback: T): Promise<T> {
  const sql = getSql();
  if (sql) {
    try {
      const rows = await withDatabaseReadRetry(async () => {
        await ensureSchema();
        return sql`
          SELECT payload
          FROM lead_store
          WHERE store_name = ${fileName}
          ORDER BY created_at DESC
        `;
      });
      return rows.map((row) => row.payload) as T;
    } catch (error) {
      handleDatabaseFailure(`Database read failed for ${fileName}.`, error);
    }
  }

  return readLocalStore(fileName, fallback);
}

export async function appendStore<T extends { id: string; createdAt: string }>(fileName: string, item: T) {
  return upsertStore(fileName, item);
}

export async function writeStore<T extends { id: string; createdAt: string; updatedAt?: string }>(fileName: string, items: T[]) {
  const sql = getSql();
  if (sql) {
    try {
      await ensureSchema();
      await sql.transaction([
        sql`DELETE FROM lead_store WHERE store_name = ${fileName}`,
        ...items.map((item) => sql`
          INSERT INTO lead_store (store_name, id, created_at, payload)
          VALUES (${fileName}, ${item.id}, ${item.createdAt}, ${JSON.stringify(item)}::jsonb)
          ON CONFLICT (store_name, id)
          DO UPDATE SET payload = EXCLUDED.payload, created_at = EXCLUDED.created_at
        `),
      ]);
      return items;
    } catch (error) {
      handleDatabaseFailure(`Database write failed for ${fileName}.`, error);
    }
  }

  await withLocalWrite(fileName, () => replaceLocalStore(fileName, items));
  return items;
}

export async function upsertStore<T extends { id: string; createdAt: string; updatedAt?: string }>(fileName: string, item: T) {
  const sql = getSql();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        INSERT INTO lead_store (store_name, id, created_at, payload)
        VALUES (${fileName}, ${item.id}, ${item.createdAt}, ${JSON.stringify(item)}::jsonb)
        ON CONFLICT (store_name, id)
        DO UPDATE SET payload = EXCLUDED.payload, created_at = EXCLUDED.created_at
      `;
      return item;
    } catch (error) {
      handleDatabaseFailure(`Database upsert failed for ${fileName}.`, error);
    }
  }

  await withLocalWrite(fileName, async () => {
    const current = await readLocalStore<T[]>(fileName, []);
    await replaceLocalStore(fileName, [item, ...current.filter((record) => record.id !== item.id)]);
  });
  return item;
}

export async function readStoreItem<T extends { id: string }>(fileName: string, id: string): Promise<T | null> {
  const sql = getSql();
  if (sql) {
    try {
      const [row] = await withDatabaseReadRetry(async () => {
        await ensureSchema();
        return sql`SELECT payload FROM lead_store WHERE store_name = ${fileName} AND id = ${id}`;
      });
      return (row?.payload as T | undefined) ?? null;
    } catch (error) {
      handleDatabaseFailure(`Database record lookup failed for ${fileName}.`, error);
    }
  }
  return (await readLocalStore<T[]>(fileName, [])).find((item) => item.id === id) ?? null;
}

export async function readStoreRange<T extends { createdAt: string }>(
  fileName: string,
  options: { from?: string; to?: string; timeZone?: string; match?: { field: string; value: string; ignoreCase?: boolean } },
): Promise<T[]> {
  const { from = "", to = "", timeZone = "Asia/Shanghai", match } = options;
  if (!from && !to && !match) return readStore<T[]>(fileName, []);
  const sql = getSql();
  if (sql) {
    try {
      const rows = await withDatabaseReadRetry(async () => {
        await ensureSchema();
        return sql`
          SELECT payload FROM lead_store WHERE store_name = ${fileName}
            AND created_at >= COALESCE(NULLIF(${from}, '')::date::timestamp AT TIME ZONE ${timeZone}, '-infinity')
            AND created_at < COALESCE((NULLIF(${to}, '')::date + 1)::timestamp AT TIME ZONE ${timeZone}, 'infinity')
            AND (${match?.field || ""} = '' OR CASE WHEN ${match?.ignoreCase || false} THEN
              lower(payload->>${match?.field || ""}::text) = lower(${match?.value || ""})
              ELSE payload->>${match?.field || ""}::text = ${match?.value || ""} END)
          ORDER BY created_at DESC, id DESC
        `;
      });
      return rows.map((row) => row.payload) as T[];
    } catch (error) {
      handleDatabaseFailure(`Database filtered read failed for ${fileName}.`, error);
    }
  }
  return (await readLocalStore<T[]>(fileName, [])).filter((item) => {
    const fields = item as Record<string, unknown>;
    const value = match ? fields[match.field] : undefined;
    const matches = !match || (match.ignoreCase ? typeof value === "string" && value.toLowerCase() === match.value.toLowerCase() : value === match.value);
    return matches && isWithinReportingDateRange(item.createdAt, from, to, timeZone);
  });
}

export async function insertStoreItem<T extends { id: string; createdAt: string }>(fileName: string, item: T) {
  const sql = getSql();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        INSERT INTO lead_store (store_name, id, created_at, payload)
        VALUES (${fileName}, ${item.id}, ${item.createdAt}, ${JSON.stringify(item)}::jsonb)
        ON CONFLICT (store_name, id) DO NOTHING
        RETURNING id
      `;
      return rows.length > 0;
    } catch (error) {
      handleDatabaseFailure(`Database insert failed for ${fileName}.`, error);
    }
  }
  return withLocalWrite(fileName, async () => {
    const current = await readLocalStore<T[]>(fileName, []);
    if (current.some((record) => record.id === item.id)) return false;
    await replaceLocalStore(fileName, [item, ...current]);
    return true;
  });
}

export async function patchStoreItem<T extends { id: string; createdAt: string }>(
  fileName: string,
  id: string,
  patch: Partial<Omit<T, "id" | "createdAt">>,
) {
  const sql = getSql();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        UPDATE lead_store
        SET payload = payload || ${JSON.stringify(patch)}::jsonb
        WHERE store_name = ${fileName} AND id = ${id}
        RETURNING id
      `;
      return rows.length > 0;
    } catch (error) {
      handleDatabaseFailure(`Database update failed for ${fileName}.`, error);
    }
  }
  return withLocalWrite(fileName, async () => {
    const current = await readLocalStore<T[]>(fileName, []);
    if (!current.some((item) => item.id === id)) return false;
    await replaceLocalStore(fileName, current.map((item) => item.id === id ? { ...item, ...patch } : item));
    return true;
  });
}

export async function deleteStoreItem<T extends { id: string; createdAt: string; updatedAt?: string }>(fileName: string, id: string) {
  const sql = getSql();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`DELETE FROM lead_store WHERE store_name = ${fileName} AND id = ${id} RETURNING id`;
      return { deleted: rows.length };
    } catch (error) {
      handleDatabaseFailure(`Database delete failed for ${fileName}.`, error);
    }
  }
  return withLocalWrite(fileName, async () => {
    const current = await readLocalStore<T[]>(fileName, []);
    const next = current.filter((item) => item.id !== id);
    const deleted = current.length - next.length;
    if (deleted) await replaceLocalStore(fileName, next);
    return { deleted };
  });
}

export async function countPendingInquiries() {
  const fileName = "inquiries.json";
  const sql = getSql();
  if (sql) {
    try {
      const [row] = await withDatabaseReadRetry(async () => {
        await ensureSchema();
        return sql`
          SELECT count(*)::int AS total FROM lead_store
          WHERE store_name = ${fileName}
            AND COALESCE(NULLIF(payload->>'status', ''), NULLIF(payload->>'stage', ''), 'new') IN ('new', 'pending')
        `;
      });
      return Number(row.total);
    } catch (error) {
      handleDatabaseFailure("Pending inquiry count failed.", error);
    }
  }
  const items = await readLocalStore<{ status?: string; stage?: string }[]>(fileName, []);
  return items.filter((item) => ["new", "pending"].includes(item.status || item.stage || "new")).length;
}

type RateLimitRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  count: number;
  windowStartedAt: string;
};

export async function incrementRequestWindow(id: string, windowMs: number, now = Date.now()) {
  const fileName = "request-rate-limits.json";
  const timestamp = new Date(now).toISOString();
  const cutoff = new Date(now - windowMs).toISOString();
  const initial: RateLimitRecord = { id, createdAt: timestamp, updatedAt: timestamp, count: 1, windowStartedAt: timestamp };
  const sql = getSql();
  if (sql) {
    try {
      await ensureSchema();
      const [row] = await sql`
        INSERT INTO lead_store (store_name, id, created_at, payload)
        VALUES (${fileName}, ${id}, ${timestamp}, ${JSON.stringify(initial)}::jsonb)
        ON CONFLICT (store_name, id) DO UPDATE SET payload = CASE
          WHEN (lead_store.payload->>'windowStartedAt')::timestamptz > ${cutoff}::timestamptz
          THEN lead_store.payload || jsonb_build_object(
            'count', LEAST(2147483646, (lead_store.payload->>'count')::int) + 1,
            'updatedAt', ${timestamp}::text
          )
          ELSE EXCLUDED.payload
        END
        RETURNING payload
      `;
      return row.payload as RateLimitRecord;
    } catch (error) {
      handleDatabaseFailure("Rate limit update failed.", error);
    }
  }
  return withLocalWrite(fileName, async () => {
    const current = await readLocalStore<RateLimitRecord[]>(fileName, []);
    const record = current.find((item) => item.id === id);
    const item = record && Date.parse(record.windowStartedAt) > now - windowMs
      ? { ...record, count: record.count + 1, updatedAt: timestamp }
      : initial;
    await replaceLocalStore(fileName, [item, ...current.filter((value) => value.id !== id)]);
    return item;
  });
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

export function submissionId(prefix: string, token: string | undefined, scope: string) {
  if (!token) return createId(prefix);
  return `${prefix}_${crypto.createHash("sha256").update(JSON.stringify([token, scope])).digest("hex")}`;
}

export async function acquireTaskLock(name: string, ttlMs = 10 * 60 * 1000) {
  const token = crypto.randomUUID();
  const sql = getSql();
  if (sql) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS task_locks (
          name TEXT PRIMARY KEY,
          token TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      const expiresAt = new Date(Date.now() + ttlMs).toISOString();
      const rows = await sql`
        INSERT INTO task_locks (name, token, expires_at, updated_at)
        VALUES (${name}, ${token}, ${expiresAt}, NOW())
        ON CONFLICT (name)
        DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at, updated_at = NOW()
        WHERE task_locks.expires_at < NOW()
        RETURNING token
      `;
      if (!rows.some((row) => row.token === token)) return null;
      return async () => {
        await sql`DELETE FROM task_locks WHERE name = ${name} AND token = ${token}`;
      };
    } catch (error) {
      handleDatabaseFailure(`Database lock failed for ${name}.`, error);
    }
  }

  await ensureRuntimeDir();
  const lockPath = path.join(runtimeDir, `${name.replace(/[^a-z0-9_-]/gi, "-")}.lock`);
  const attempt = async () => {
    const handle = await fs.open(lockPath, "wx");
    await handle.writeFile(JSON.stringify({ token, expiresAt: Date.now() + ttlMs }));
    await handle.close();
  };
  try {
    await attempt();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    const details = await fs.stat(lockPath).catch(() => null);
    if (!details || Date.now() - details.mtimeMs <= ttlMs) return null;
    await fs.rm(lockPath, { force: true });
    await attempt();
  }

  return async () => {
    const current = await fs.readFile(lockPath, "utf8").catch(() => "");
    if (current.includes(token)) await fs.rm(lockPath, { force: true });
  };
}
