import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

export type SearchConsoleSubmission = {
  attempted: boolean;
  success: boolean;
  status: "disabled" | "not_configured" | "submitted" | "failed";
  message: string;
  httpStatus?: number;
};

type SearchConsoleOptions = {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
};

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function loadCredentials(env: NodeJS.ProcessEnv) {
  const inline = env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON;
  const base64 = env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64;
  const filePath = env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH;
  let raw = inline || "";
  if (!raw && base64) raw = Buffer.from(base64, "base64").toString("utf8");
  if (!raw && filePath) raw = await readFile(filePath, "utf8");
  if (!raw) return null;
  const credentials = JSON.parse(raw) as ServiceAccountCredentials;
  if (!credentials.client_email || !credentials.private_key) throw new Error("Service Account credentials are incomplete.");
  return credentials;
}

function createAssertion(credentials: ServiceAccountCredentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: credentials.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${base64Url(signer.sign(credentials.private_key))}`;
}

async function fetchWithTimeout(fetchImpl: typeof fetch, input: string, init: RequestInit, timeoutMs = 12_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function requestWithRetry(fetchImpl: typeof fetch, input: string, init: RequestInit, retries = 1) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(fetchImpl, input, init);
      if (response.status < 500 || attempt === retries) return response;
    } catch (error) {
      lastError = error;
      if (attempt === retries) throw error;
    }
  }
  throw lastError || new Error("Search Console request failed.");
}

export async function submitSitemapToSearchConsole(options: SearchConsoleOptions = {}): Promise<SearchConsoleSubmission> {
  const env = options.env || process.env;
  const fetchImpl = options.fetchImpl || fetch;
  if (env.GOOGLE_SEARCH_CONSOLE_ENABLED !== "true") {
    return { attempted: false, success: false, status: "disabled", message: "Search Console submission is disabled." };
  }

  const siteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
  const sitemapUrl = env.GOOGLE_SEARCH_CONSOLE_SITEMAP_URL;
  if (!siteUrl || !sitemapUrl) {
    return { attempted: false, success: false, status: "not_configured", message: "Search Console site or Sitemap URL is missing." };
  }

  try {
    const sitemapResponse = await fetchWithTimeout(fetchImpl, sitemapUrl, { method: "GET", redirect: "follow" });
    if (!sitemapResponse.ok) {
      return { attempted: false, success: false, status: "failed", message: `Sitemap URL returned HTTP ${sitemapResponse.status}.`, httpStatus: sitemapResponse.status };
    }
    const credentials = await loadCredentials(env);
    if (!credentials) {
      return { attempted: false, success: false, status: "not_configured", message: "Service Account credentials are missing." };
    }

    const tokenResponse = await requestWithRetry(fetchImpl, credentials.token_uri || "https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: createAssertion(credentials),
      }),
    });
    if (!tokenResponse.ok) {
      return { attempted: true, success: false, status: "failed", message: `Google authentication failed with HTTP ${tokenResponse.status}.`, httpStatus: tokenResponse.status };
    }
    const tokenPayload = await tokenResponse.json() as { access_token?: string };
    if (!tokenPayload.access_token) throw new Error("Google authentication response did not include an access token.");

    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
    const submitResponse = await requestWithRetry(fetchImpl, endpoint, {
      method: "PUT",
      headers: { authorization: `Bearer ${tokenPayload.access_token}` },
    });
    if (!submitResponse.ok) {
      return { attempted: true, success: false, status: "failed", message: `Search Console Sitemaps API returned HTTP ${submitResponse.status}.`, httpStatus: submitResponse.status };
    }
    return { attempted: true, success: true, status: "submitted", message: "Sitemap submitted to Google Search Console Sitemaps API.", httpStatus: submitResponse.status };
  } catch (error) {
    return {
      attempted: true,
      success: false,
      status: "failed",
      message: error instanceof Error ? error.message : "Unknown Search Console submission error.",
    };
  }
}
