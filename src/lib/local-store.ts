import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

const runtimeDir = process.env.VERCEL
  ? path.join("/tmp", "flameprimes-runtime")
  : path.join(process.cwd(), "data", "runtime");

let schemaReady: Promise<void> | null = null;

function getDatabaseUrl() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
}

function getSql() {
  const databaseUrl = getDatabaseUrl();
  return databaseUrl ? neon(databaseUrl) : null;
}

async function ensureSchema() {
  const sql = getSql();
  if (!sql) return;
  schemaReady ??= sql`
    CREATE TABLE IF NOT EXISTS lead_store (
      store_name TEXT NOT NULL,
      id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      payload JSONB NOT NULL,
      PRIMARY KEY (store_name, id)
    )
  `.then(() => undefined);
  await schemaReady;
}

async function ensureRuntimeDir() {
  await fs.mkdir(runtimeDir, { recursive: true });
}

export async function readStore<T>(fileName: string, fallback: T): Promise<T> {
  const sql = getSql();
  if (sql) {
    await ensureSchema();
    const rows = await sql`
      SELECT payload
      FROM lead_store
      WHERE store_name = ${fileName}
      ORDER BY created_at DESC
      LIMIT 1000
    `;
    return rows.map((row) => row.payload) as T;
  }

  await ensureRuntimeDir();
  const filePath = path.join(runtimeDir, fileName);
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

export async function appendStore<T extends { id: string; createdAt: string }>(fileName: string, item: T) {
  const sql = getSql();
  if (sql) {
    await ensureSchema();
    await sql`
      INSERT INTO lead_store (store_name, id, created_at, payload)
      VALUES (${fileName}, ${item.id}, ${item.createdAt}, ${JSON.stringify(item)}::jsonb)
      ON CONFLICT (store_name, id)
      DO UPDATE SET payload = EXCLUDED.payload, created_at = EXCLUDED.created_at
    `;
    return item;
  }

  const current = await readStore<T[]>(fileName, []);
  current.unshift(item);
  await fs.writeFile(path.join(runtimeDir, fileName), JSON.stringify(current, null, 2));
  return item;
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}
