import { createHash } from "node:crypto";
import { readStore, upsertStore } from "@/lib/local-store";

type RateLimitRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  count: number;
  windowStartedAt: string;
};

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

function identifier(request: Request, scope: string) {
  const secret = process.env.REQUEST_RATE_LIMIT_SECRET
    || process.env.ADMIN_SESSION_SECRET
    || "local-rate-limit-secret";
  return createHash("sha256")
    .update(`${scope}|${clientAddress(request)}|${secret}`)
    .digest("hex")
    .slice(0, 32);
}

export async function checkRequestRateLimit(
  request: Request,
  scope: string,
  options: { limit: number; windowMs: number },
) {
  const now = Date.now();
  const id = `request_limit_${scope}_${identifier(request, scope)}`;
  const records = await readStore<RateLimitRecord[]>("request-rate-limits.json", []);
  const current = records.find((item) => item.id === id);
  const currentWindow = current && now - Date.parse(current.windowStartedAt) < options.windowMs;
  const count = currentWindow ? current.count + 1 : 1;
  const windowStartedAt = currentWindow ? current.windowStartedAt : new Date(now).toISOString();
  const retryAfterSeconds = Math.max(1, Math.ceil((Date.parse(windowStartedAt) + options.windowMs - now) / 1000));

  await upsertStore<RateLimitRecord>("request-rate-limits.json", {
    id,
    createdAt: current?.createdAt || new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    count,
    windowStartedAt,
  });

  return { allowed: count <= options.limit, retryAfterSeconds };
}
