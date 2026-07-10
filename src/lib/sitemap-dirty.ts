import { upsertStore } from "@/lib/local-store";

const DIRTY_STORE = "sitemap-dirty.json";

export async function markSitemapDirty(reason: string) {
  const now = new Date().toISOString();
  await upsertStore(DIRTY_STORE, { id: "sitemap_dirty", createdAt: now, updatedAt: now, reason });
}
