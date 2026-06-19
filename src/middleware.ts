import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "grimm_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function verifySession(session: string | undefined, secret: string) {
  if (!session) return false;
  const [timestamp, signature] = session.split(".");
  if (!timestamp || !signature) return false;
  const createdAt = Number(timestamp);
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > SESSION_TTL_MS) return false;
  return signature === await sign(timestamp, secret);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectsAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const protectsAdminReadApi =
    request.method === "GET" &&
    ["/api/inquiries", "/api/download-leads", "/api/analytics"].includes(pathname);

  if (!protectsAdminPage && !protectsAdminReadApi) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  const isAuthed = secret
    ? await verifySession(request.cookies.get(ADMIN_COOKIE_NAME)?.value, secret)
    : false;

  if (isAuthed) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/inquiries", "/api/download-leads", "/api/analytics"],
};
