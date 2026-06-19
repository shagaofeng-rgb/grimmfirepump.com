import { promises as fs } from "fs";
import path from "path";

const runtimeDir = process.env.VERCEL
  ? path.join("/tmp", "flameprimes-runtime")
  : path.join(process.cwd(), "data", "runtime");

async function ensureRuntimeDir() {
  await fs.mkdir(runtimeDir, { recursive: true });
}

export async function readStore<T>(fileName: string, fallback: T): Promise<T> {
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
  const current = await readStore<T[]>(fileName, []);
  current.unshift(item);
  await fs.writeFile(path.join(runtimeDir, fileName), JSON.stringify(current, null, 2));
  return item;
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}
