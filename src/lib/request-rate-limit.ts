import { createHash } from "node:crypto";
import { incrementRequestWindow } from "@/lib/local-store";

function clientAddress(headers: Headers) {
  return (process.env.VERCEL ? headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : undefined)
    || headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headers.get("x-real-ip")?.trim()
    || "unknown";
}

function identifier(headers: Headers, scope: string) {
  const secret = process.env.REQUEST_RATE_LIMIT_SECRET
    || process.env.ADMIN_SESSION_SECRET
    || "local-rate-limit-secret";
  return createHash("sha256")
    .update(`${scope}|${clientAddress(headers)}|${secret}`)
    .digest("hex")
    .slice(0, 32);
}

export async function checkRequestRateLimit(
  request: { headers: Headers },
  scope: string,
  options: { limit: number; windowMs: number },
) {
  const now = Date.now();
  const id = `request_limit_${scope}_${identifier(request.headers, scope)}`;
  const { count, windowStartedAt } = await incrementRequestWindow(id, options.windowMs, now);
  const retryAfterSeconds = Math.max(1, Math.ceil((Date.parse(windowStartedAt) + options.windowMs - now) / 1000));
  return { allowed: count <= options.limit, retryAfterSeconds };
}
