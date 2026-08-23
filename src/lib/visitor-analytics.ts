import type { AnalyticsEventRecord } from "@/lib/admin-data";

export type AnalyticsFilters = {
  from?: string;
  to?: string;
  country?: string;
  channel?: string;
  traffic?: "real" | "test" | "bot" | "all";
  query?: string;
};

export type AnalyticsSummary = {
  realEvents: AnalyticsEventRecord[];
  visibleEvents: AnalyticsEventRecord[];
  pageViews: AnalyticsEventRecord[];
  conversions: AnalyticsEventRecord[];
  uniqueVisitors: number;
  uniqueSessions: number;
  returningVisitors: number;
  filteredEvents: number;
  topPages: Array<[string, number]>;
  countries: Array<[string, number]>;
  channels: Array<[string, number]>;
  recentActivity: AnalyticsEventRecord[];
};

const conversionEvents = new Set(["inquiry_submit", "download_click", "whatsapp_click", "quote_request"]);

export function normalizeDateBoundary(value: string | undefined, end = false) {
  if (!value) return null;
  const date = new Date(value + (end ? "T23:59:59.999Z" : "T00:00:00.000Z"));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isWithinDateRange(createdAt: string, filters: AnalyticsFilters) {
  const date = new Date(createdAt);
  const from = normalizeDateBoundary(filters.from);
  const to = normalizeDateBoundary(filters.to, true);
  return (!from || date >= from) && (!to || date <= to);
}

export function countBy(items: AnalyticsEventRecord[], select: (item: AnalyticsEventRecord) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = select(item) || "Unknown";
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function filterAnalyticsEvents(events: AnalyticsEventRecord[], filters: AnalyticsFilters = {}) {
  const traffic = filters.traffic || "real";
  const query = filters.query?.trim().toLowerCase();
  return events.filter((item) => {
    if (!isWithinDateRange(item.createdAt, filters)) return false;
    if (traffic !== "all" && item.trafficType !== traffic) return false;
    if (filters.country && filters.country !== "all" && item.countryCode !== filters.country) return false;
    if (filters.channel && filters.channel !== "all" && item.channel !== filters.channel) return false;
    if (!query) return true;
    return [item.path, item.label, item.country, item.channel, item.referrer, item.visitorId, item.ipMasked]
      .join(" ").toLowerCase().includes(query);
  });
}

export function getAnalyticsSummary(events: AnalyticsEventRecord[], filters: AnalyticsFilters = {}): AnalyticsSummary {
  const visibleEvents = filterAnalyticsEvents(events, filters);
  const realEvents = events.filter((item) => item.trafficType === "real");
  const pageViews = visibleEvents.filter((item) => item.event === "page_view");
  const conversions = visibleEvents.filter((item) => conversionEvents.has(item.event));
  const visitorIds = new Set(pageViews.map((item) => item.visitorId).filter(Boolean));
  const sessionIds = new Set(pageViews.map((item) => item.sessionId).filter(Boolean));
  const returningVisitors = new Set(pageViews.filter((item) => (item.visitNumber || 1) > 1).map((item) => item.visitorId).filter(Boolean));
  return {
    realEvents,
    visibleEvents,
    pageViews,
    conversions,
    uniqueVisitors: visitorIds.size,
    uniqueSessions: sessionIds.size,
    returningVisitors: returningVisitors.size,
    filteredEvents: events.length - realEvents.length,
    topPages: countBy(pageViews, (item) => item.path || "/").slice(0, 8),
    countries: countBy(pageViews, (item) => item.country || "Unknown").slice(0, 8),
    channels: countBy(pageViews, (item) => item.channel || "Direct").slice(0, 8),
    recentActivity: [...visibleEvents].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 12),
  };
}

export function paginate<T>(items: T[], page = 1, pageSize = 25) {
  const safePageSize = [20, 25, 50, 100].includes(pageSize) ? pageSize : 25;
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((currentPage - 1) * safePageSize, currentPage * safePageSize),
    page: currentPage,
    pageSize: safePageSize,
    total: items.length,
    totalPages,
  };
}
