import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { readStore } from "@/lib/local-store";

export const ADMIN_COOKIE_NAME = "grimm_admin_session";
export const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 8;
export const REMEMBER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

export type AdminRole = "super_admin" | "content_manager" | "product_manager" | "sales" | "analyst";

export type AdminSession = {
  username: string;
  displayName: string;
  role: AdminRole;
  createdAt: number;
  expiresAt: number;
};

export type AdminCredential = {
  id: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  passwordHash: string;
};

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "local-admin-development-secret";
}

export function getConfiguredAdminUser() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    displayName: process.env.ADMIN_DISPLAY_NAME || "GRIMM Admin",
    role: (process.env.ADMIN_ROLE || "super_admin") as AdminRole,
  };
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD);
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function verifyScryptPassword(password: string, passwordHash: string) {
  const [, salt, stored] = passwordHash.split(":");
  if (!salt || !stored) return false;
  const actual = Buffer.from(scryptSync(password, salt, 64).toString("hex"));
  const expected = Buffer.from(stored);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function verifyAdminPassword(username: FormDataEntryValue | null, password: FormDataEntryValue | null) {
  const admin = getConfiguredAdminUser();
  if (typeof username !== "string" || typeof password !== "string") return false;
  if (username.trim().toLowerCase() !== admin.username.toLowerCase()) return false;

  const credentials = await readStore<AdminCredential[]>("admin-credentials.json", []);
  const databaseCredential = credentials.find((item) => item.username.toLowerCase() === admin.username.toLowerCase());
  if (databaseCredential?.passwordHash) {
    return verifyScryptPassword(password, databaseCredential.passwordHash);
  }

  const configuredHash = process.env.ADMIN_PASSWORD_HASH;
  if (configuredHash) {
    return verifyScryptPassword(password, configuredHash);
  }

  const legacyPassword = process.env.ADMIN_PASSWORD;
  if (!legacyPassword) return false;
  const expectedBuffer = Buffer.from(legacyPassword);
  const actualBuffer = Buffer.from(password);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function createAdminSessionValue(remember = false, now = Date.now()) {
  const admin = getConfiguredAdminUser();
  const ttl = remember ? REMEMBER_SESSION_TTL_MS : DEFAULT_SESSION_TTL_MS;
  const session: AdminSession = {
    username: admin.username,
    displayName: admin.displayName,
    role: admin.role,
    createdAt: now,
    expiresAt: now + ttl,
  };
  const payload = encodeBase64Url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionValue(session?: string | null): AdminSession | null {
  if (!session) return null;
  const [payload, signature] = session.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) return null;

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as AdminSession;
    if (!parsed.username || !parsed.expiresAt || Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionValue(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function isAdminAuthenticated() {
  return Boolean(await getCurrentAdmin());
}

export async function setAdminSessionCookie(remember = false) {
  const cookieStore = await cookies();
  const maxAge = (remember ? REMEMBER_SESSION_TTL_MS : DEFAULT_SESSION_TTL_MS) / 1000;
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionValue(remember), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
