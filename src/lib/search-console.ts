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

export type SearchConsoleConfiguration = {
  enabled: boolean;
  configured: boolean;
  siteUrl: string;
  sitemapUrl: string;
  propertyType: "domain" | "url-prefix" | "missing";
  credentialsConfigured: boolean;
  verificationMetaConfigured: boolean;
  status: "disabled" | "not_configured" | "ready";
  message: string;
};

export type SearchConsoleConnectionCheck = SearchConsoleConfiguration & {
  checkedAt: string;
  attempted: boolean;
  connected: boolean;
  httpStatus?: number;
};

type SearchConsoleOptions = {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
};

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function getConfiguration(env: NodeJS.ProcessEnv): SearchConsoleConfiguration {
  const enabled = env.GOOGLE_SEARCH_CONSOLE_ENABLED === "true";
  const siteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim() || "";
  const sitemapUrl = env.GOOGLE_SEARCH_CONSOLE_SITEMAP_URL?.trim() || "";
  const credentialsConfigured = Boolean(
    env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON
      || env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON
      || env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64
      || env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH,
  );
  const propertyType = !siteUrl ? "missing" : siteUrl.startsWith("sc-domain:") ? "domain" : "url-prefix";
  const verificationMetaConfigured = Boolean(env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim());

  if (!enabled) {
    return {
      enabled,
      configured: false,
      siteUrl,
      sitemapUrl,
      propertyType,
      credentialsConfigured,
      verificationMetaConfigured,
      status: "disabled",
      message: "Search Console automation is disabled. Set GOOGLE_SEARCH_CONSOLE_ENABLED=true only after the property and service account are ready.",
    };
  }

  if (!siteUrl || !sitemapUrl || !credentialsConfigured) {
    return {
      enabled,
      configured: false,
      siteUrl,
      sitemapUrl,
      propertyType,
      credentialsConfigured,
      verificationMetaConfigured,
      status: "not_configured",
      message: "Google Search Console needs a property URL, sitemap URL and service-account credentials.",
    };
  }

  return {
    enabled,
    configured: true,
    siteUrl,
    sitemapUrl,
    propertyType,
    credentialsConfigured,
    verificationMetaConfigured,
    status: "ready",
    message: "Configuration is present. Run the protected connection check to confirm that Google accepted the service account.",
  };
}

export function getSearchConsoleConfiguration(env: NodeJS.ProcessEnv = process.env) {
  return getConfiguration(env);
}

async function loadCredentials(env: NodeJS.ProcessEnv) {
  const inline = env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON || env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON;
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

async function getAccessToken(credentials: ServiceAccountCredentials, fetchImpl: typeof fetch) {
  const tokenResponse = await requestWithRetry(fetchImpl, credentials.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: createAssertion(credentials),
    }),
  });

  if (!tokenResponse.ok) {
    return { accessToken: "", httpStatus: tokenResponse.status, message: `Google authentication failed with HTTP ${tokenResponse.status}.` };
  }

  const tokenPayload = await tokenResponse.json() as { access_token?: string };
  if (!tokenPayload.access_token) {
    return { accessToken: "", httpStatus: tokenResponse.status, message: "Google authentication response did not include an access token." };
  }

  return { accessToken: tokenPayload.access_token, httpStatus: tokenResponse.status, message: "Google authentication succeeded." };
}

export async function checkSearchConsoleConnection(options: SearchConsoleOptions = {}): Promise<SearchConsoleConnectionCheck> {
  const env = options.env || process.env;
  const fetchImpl = options.fetchImpl || fetch;
  const configuration = getConfiguration(env);
  const checkedAt = new Date().toISOString();

  if (configuration.status !== "ready") {
    return { ...configuration, checkedAt, attempted: false, connected: false };
  }

  try {
    const credentials = await loadCredentials(env);
    if (!credentials) {
      return { ...configuration, checkedAt, attempted: false, connected: false, status: "not_configured", configured: false, message: "Service Account credentials are missing." };
    }
    const token = await getAccessToken(credentials, fetchImpl);
    if (!token.accessToken) {
      return { ...configuration, checkedAt, attempted: true, connected: false, status: "not_configured", configured: false, httpStatus: token.httpStatus, message: token.message };
    }

    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(configuration.siteUrl)}`;
    const response = await requestWithRetry(fetchImpl, endpoint, {
      method: "GET",
      headers: { authorization: `Bearer ${token.accessToken}` },
    });

    if (!response.ok) {
      return {
        ...configuration,
        checkedAt,
        attempted: true,
        connected: false,
        status: "not_configured",
        configured: false,
        httpStatus: response.status,
        message: response.status === 403 || response.status === 404
          ? "Google did not authorize this service account for the configured Search Console property."
          : `Search Console property check failed with HTTP ${response.status}.`,
      };
    }

    return {
      ...configuration,
      checkedAt,
      attempted: true,
      connected: true,
      status: "ready",
      httpStatus: response.status,
      message: "Google accepted the configured service account for this Search Console property.",
    };
  } catch (error) {
    return {
      ...configuration,
      checkedAt,
      attempted: true,
      connected: false,
      status: "not_configured",
      configured: false,
      message: error instanceof Error ? error.message : "Unknown Search Console connection error.",
    };
  }
}

export async function submitSitemapToSearchConsole(options: SearchConsoleOptions = {}): Promise<SearchConsoleSubmission> {
  const env = options.env || process.env;
  const fetchImpl = options.fetchImpl || fetch;
  const configuration = getConfiguration(env);
  if (configuration.status === "disabled") {
    return { attempted: false, success: false, status: "disabled", message: configuration.message };
  }
  if (configuration.status !== "ready") {
    return { attempted: false, success: false, status: "not_configured", message: configuration.message };
  }

  try {
    const sitemapResponse = await fetchWithTimeout(fetchImpl, configuration.sitemapUrl, { method: "GET", redirect: "follow" });
    if (!sitemapResponse.ok) {
      return { attempted: false, success: false, status: "failed", message: `Sitemap URL returned HTTP ${sitemapResponse.status}.`, httpStatus: sitemapResponse.status };
    }
    const credentials = await loadCredentials(env);
    if (!credentials) {
      return { attempted: false, success: false, status: "not_configured", message: "Service Account credentials are missing." };
    }

    const token = await getAccessToken(credentials, fetchImpl);
    if (!token.accessToken) {
      return { attempted: true, success: false, status: "failed", message: token.message, httpStatus: token.httpStatus };
    }

    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(configuration.siteUrl)}/sitemaps/${encodeURIComponent(configuration.sitemapUrl)}`;
    const submitResponse = await requestWithRetry(fetchImpl, endpoint, {
      method: "PUT",
      headers: { authorization: `Bearer ${token.accessToken}` },
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
