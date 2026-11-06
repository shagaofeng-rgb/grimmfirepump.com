import { BlockList, isIP } from "node:net";
import { unstable_cache } from "next/cache";
import { getSiteSettings } from "@/lib/admin-cms";

const readTrafficSettings = unstable_cache(getSiteSettings, ["traffic-settings-v1"], { tags: ["traffic-settings"], revalidate: 300 });
const automatedAgents = /(?:bot|crawler|spider|lighthouse|headless|playwright|puppeteer|selenium|curl|wget|collects)/i;

export function externalReferrer(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.origin : "";
  } catch {
    return "";
  }
}

export function trafficChannel(input: { referrer: string; utmSource: string; utmMedium: string }) {
  const medium = input.utmMedium.trim().toLowerCase();
  const host = externalReferrer(input.referrer).split("://")[1] || "";
  if (/cpc|paid|ppc/.test(medium)) return "Paid";
  if (medium.includes("email")) return "Email";
  if (input.utmSource) return "Campaign";
  if (/(^|\.)(google\.[a-z.]+|bing\.com|yahoo\.com|baidu\.com|duckduckgo\.com|yandex\.[a-z.]+)$/.test(host)) return "Organic search";
  if (/(^|\.)(facebook\.com|instagram\.com|linkedin\.com|tiktok\.com|youtube\.com|x\.com|twitter\.com|pinterest\.com)$/.test(host)) return "Social";
  return host ? "Referral" : "Direct";
}

function values(input: string) {
  return input.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function ipRule(rule: string) {
  const [address, prefix, extra] = rule.split("/");
  const version = isIP(address);
  if (!version || extra !== undefined || (prefix !== undefined && (!/^\d+$/.test(prefix) || Number(prefix) > (version === 4 ? 32 : 128)))) return null;
  return { address, family: version === 4 ? "ipv4" as const : "ipv6" as const, prefix: prefix === undefined ? undefined : Number(prefix) };
}

export function validTrafficExclusions(input: string) {
  return values(input).every((rule) => Boolean(ipRule(rule)));
}

function excludedAddress(input: string, address: string) {
  const version = isIP(address);
  if (!version) return false;
  const block = new BlockList();
  for (const value of values(input)) {
    const rule = ipRule(value);
    if (!rule) continue;
    if (rule.prefix === undefined) block.addAddress(rule.address, rule.family);
    else block.addSubnet(rule.address, rule.prefix, rule.family);
  }
  return block.check(address, version === 4 ? "ipv4" : "ipv6");
}

export async function classifyTraffic(request: Request, path: string, testTraffic: boolean) {
  const host = new URL(request.url).hostname;
  const userAgent = (request.headers.get("user-agent") || "").slice(0, 500);
  const ip = (request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "").split(",")[0].trim();
  if (/^\/admin(?:\/|$)/.test(path) || host.endsWith(".vercel.app") || ["127.0.0.1", "localhost"].includes(host) || testTraffic) {
    return { trafficType: "test" as const, trafficReason: "preview_or_test_environment" };
  }
  if (automatedAgents.test(userAgent)) return { trafficType: "bot" as const, trafficReason: "automated_user_agent" };
  const settings = await readTrafficSettings();
  if (excludedAddress([process.env.ANALYTICS_EXCLUDED_IPS || "", settings.analyticsExcludedIps].join(","), ip)) {
    return { trafficType: "test" as const, trafficReason: "excluded_ip" };
  }
  if (values([process.env.ANALYTICS_EXCLUDED_USER_AGENTS || "", settings.analyticsExcludedUserAgents].join(",")).some((item) => userAgent.toLowerCase().includes(item.toLowerCase()))) {
    return { trafficType: "test" as const, trafficReason: "excluded_user_agent" };
  }
  return { trafficType: "real" as const, trafficReason: "" };
}

export function trafficLocation(request: Request) {
  const countryCode = (request.headers.get("x-vercel-ip-country") || "").slice(0, 2).toUpperCase();
  const country = /^[A-Z]{2}$/.test(countryCode) ? new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) : undefined;
  return {
    countryCode,
    country: country || "Unknown",
    region: (request.headers.get("x-vercel-ip-country-region") || "").slice(0, 24),
    city: (request.headers.get("x-vercel-ip-city") || "").slice(0, 120),
    userAgent: (request.headers.get("user-agent") || "").slice(0, 500),
  };
}
