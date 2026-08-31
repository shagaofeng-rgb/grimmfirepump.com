import { NextResponse, type NextRequest } from "next/server";
import { legacyUrlDecision } from "@/lib/legacy-url-governance";

const ADMIN_COOKIE_NAME = "grimm_admin_session";
const localePattern = /^\/(es|ru|ar|fr|pt)(?:\/|$)/;
const productRedirects: Record<string, string> = {
  "/products/GW-Sewage-Pump-Series-Set": "/products/GW-Sewage-Pump-Series-Pump",
  "/products/LW-Sewage-Pump-Series-Set": "/products/LW-Sewage-Pump-Series-Pump",
};

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

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

type MiddlewareSession = { expiresAt?: number; role?: string };

async function verifySession(session: string | undefined, secret: string): Promise<MiddlewareSession | null> {
  if (!session) return null;
  const [payload, signature] = session.split(".");
  if (!payload || !signature) return null;
  const expected = await sign(payload, secret);
  if (signature !== expected) return null;
  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as MiddlewareSession;
    return parsed.expiresAt && Date.now() <= parsed.expiresAt ? parsed : null;
  } catch {
    return null;
  }
}

function adminRouteAllowed(pathname: string, role = "") {
  if (role === "super_admin") return true;
  if (pathname.startsWith("/admin/products") || pathname.startsWith("/admin/product-categories") || pathname.startsWith("/admin/product-knowledge")) return role === "product_manager";
  if (pathname.startsWith("/admin/news") || pathname.startsWith("/admin/pages")) return role === "content_manager";
  if (pathname.startsWith("/admin/media") || pathname.startsWith("/admin/downloads")) return role === "content_manager" || role === "product_manager";
  if (pathname.startsWith("/admin/leads") || pathname.startsWith("/admin/forms")) return role === "sales";
  if (pathname.startsWith("/admin/analytics")) return role === "analyst";
  return pathname === "/admin" || pathname.startsWith("/admin/dashboard");
}

function adminApiAllowed(pathname: string, role = "") {
  if (role === "super_admin") return true;
  if (pathname.startsWith("/api/admin/news")) return role === "content_manager";
  if (pathname.startsWith("/api/admin/uploads")) return role === "content_manager" || role === "product_manager";
  if (pathname === "/api/inquiries" || pathname === "/api/download-leads") return role === "sales";
  if (pathname === "/api/analytics") return role === "analyst";
  return false;
}

export async function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  // Do not redirect a custom-webhook POST before its request body reaches the
  // internal endpoint. GET requests on the bare domain keep the canonical redirect.
  if (host === "grimmfirepump.com" && !(request.method === "POST" && request.nextUrl.pathname === "/")) {
    const target = request.nextUrl.clone();
    target.protocol = "https";
    target.host = "www.grimmfirepump.com";
    return NextResponse.redirect(target, 301);
  }

  const pathname = request.nextUrl.pathname;
  // The external publishing plugin verifies and posts to the site root when
  // configured as a custom framework webhook. Keep GET / unchanged.
  if (request.method === "POST" && pathname === "/") {
    const target = request.nextUrl.clone();
    target.pathname = "/api/webhook/send_article";
    return NextResponse.rewrite(target);
  }

  const productRedirect = productRedirects[pathname];
  if (productRedirect) {
    const target = request.nextUrl.clone();
    target.pathname = productRedirect;
    target.search = "";
    return NextResponse.redirect(target, 301);
  }
  const legacyDecision = legacyUrlDecision(pathname);
  if (legacyDecision?.kind === "gone") {
    return new NextResponse("Gone", { status: 410, headers: { "cache-control": "public, max-age=86400" } });
  }
  if (legacyDecision?.kind === "redirect") {
    const target = request.nextUrl.clone();
    target.pathname = legacyDecision.destination;
    target.search = "";
    return NextResponse.redirect(target, 301);
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-locale", pathname.match(localePattern)?.[1] || "en");

  const protectsAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const protectsAdminApi = pathname.startsWith("/api/admin/")
    || (request.method === "GET" && ["/api/inquiries", "/api/download-leads", "/api/analytics"].includes(pathname));
  if (!protectsAdminPage && !protectsAdminApi) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD;
  const session = secret ? await verifySession(request.cookies.get(ADMIN_COOKIE_NAME)?.value, secret) : null;
  const authorizedForRoute = protectsAdminPage
    ? adminRouteAllowed(pathname, session?.role)
    : adminApiAllowed(pathname, session?.role);
  if (session && authorizedForRoute) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (session && protectsAdminPage) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin/dashboard";
    dashboardUrl.searchParams.set("error", "forbidden");
    return NextResponse.redirect(dashboardUrl);
  }

  if (session && protectsAdminApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
