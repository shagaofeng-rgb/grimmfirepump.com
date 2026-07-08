"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { setAdminSessionCookie, verifyAdminPassword } from "@/lib/admin-auth";
import { appendStore, createId, readStore, writeStore } from "@/lib/local-store";

type LoginAttempt = {
  id: string;
  createdAt: string;
  username: string;
  ip: string;
  success: boolean;
  reason: string;
  userAgent: string;
};

type RateLimitRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  key: string;
  attempts: number;
  blockedUntil?: string;
};

async function getRequestMeta() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown";
  return {
    ip,
    userAgent: headerStore.get("user-agent") || "unknown",
  };
}

async function recordLogin(username: string, success: boolean, reason: string) {
  const meta = await getRequestMeta();
  await appendStore<LoginAttempt>("login-logs.json", {
    id: createId("login"),
    createdAt: new Date().toISOString(),
    username,
    ip: meta.ip,
    userAgent: meta.userAgent,
    success,
    reason,
  });
}

async function checkRateLimit(username: string) {
  const meta = await getRequestMeta();
  const key = `${meta.ip}:${username.toLowerCase()}`;
  const records = await readStore<RateLimitRecord[]>("login-rate-limits.json", []);
  const record = records.find((item) => item.key === key);
  if (!record?.blockedUntil) return { blocked: false, key, records };
  return { blocked: Date.now() < Date.parse(record.blockedUntil), key, records };
}

async function updateRateLimit(key: string, records: RateLimitRecord[], success: boolean) {
  const now = new Date().toISOString();
  const existing = records.find((item) => item.key === key);
  const next = records.filter((item) => item.key !== key);

  if (success) {
    await writeStore("login-rate-limits.json", next);
    return;
  }

  const attempts = (existing?.attempts || 0) + 1;
  const blockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : existing?.blockedUntil;
  next.unshift({
    id: existing?.id || createId("rate"),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    key,
    attempts,
    blockedUntil,
  });
  await writeStore("login-rate-limits.json", next);
}

export async function loginAdmin(_: { error?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = formData.get("password");
  const remember = formData.get("remember") === "on";
  const rate = await checkRateLimit(username || "unknown");

  if (rate.blocked) {
    await recordLogin(username, false, "rate_limited");
    return { error: "登录失败次数过多，请 15 分钟后再试。" };
  }

  if (!(await verifyAdminPassword(username, password))) {
    await updateRateLimit(rate.key, rate.records, false);
    await recordLogin(username, false, "invalid_credentials");
    return { error: "账号或密码错误。" };
  }

  await updateRateLimit(rate.key, rate.records, true);
  await recordLogin(username, true, "success");
  await setAdminSessionCookie(remember);
  redirect("/admin/dashboard");
}
