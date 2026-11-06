"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { setAdminSessionCookie, verifyAdminPassword } from "@/lib/admin-auth";
import { appendStore, createId } from "@/lib/local-store";
import { checkRequestRateLimit } from "@/lib/request-rate-limit";

type LoginAttempt = {
  id: string;
  createdAt: string;
  username: string;
  ip: string;
  success: boolean;
  reason: string;
  userAgent: string;
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

export async function loginAdmin(_: { error?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") || "").trim().slice(0, 120);
  const password = formData.get("password");
  const remember = formData.get("remember") === "on";
  const rate = await checkRequestRateLimit({ headers: await headers() }, "admin-login", { limit: 10, windowMs: 15 * 60 * 1000 });

  if (!rate.allowed) {
    return { error: "登录失败次数过多，请 15 分钟后再试。" };
  }

  if (typeof password !== "string" || password.length > 512 || !(await verifyAdminPassword(username, password))) {
    await recordLogin(username, false, "invalid_credentials");
    return { error: "账号或密码错误。" };
  }

  await recordLogin(username, true, "success");
  await setAdminSessionCookie(remember);
  redirect("/admin/dashboard");
}
