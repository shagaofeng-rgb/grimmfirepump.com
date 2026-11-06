export type DateRangePreset = "today" | "week" | "month" | "last30" | "custom" | "all";

export type ResolvedDateRange = {
  preset: DateRangePreset;
  from: string;
  to: string;
  label: string;
};

export function dateParts(date: Date, timeZone: string) {
  return dateFormatter(timeZone).format(date);
}

export function formatReportingTimestamp(value: string, timeZone = "Asia/Shanghai") {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-CN", { timeZone, dateStyle: "medium", timeStyle: "short" }).format(date);
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
function dateFormatter(timeZone: string) {
  const existing = dateFormatters.get(timeZone);
  if (existing) return existing;
  const formatter = new Intl.DateTimeFormat("sv-SE", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  if (dateFormatters.size < 32) dateFormatters.set(timeZone, formatter);
  return formatter;
}

function validDay(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value ? value : "";
}

export function isWithinReportingDateRange(createdAt: string | undefined, from: string, to: string, timeZone = "Asia/Shanghai") {
  if (!createdAt || Number.isNaN(Date.parse(createdAt))) return false;
  const day = dateParts(new Date(createdAt), timeZone);
  return (!from || day >= from) && (!to || day <= to);
}

function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function monthStart(date: string) {
  return `${date.slice(0, 7)}-01`;
}

function mondayOfWeek(date: string) {
  const value = new Date(`${date}T12:00:00.000Z`);
  const weekday = value.getUTCDay() || 7;
  return shiftDate(date, 1 - weekday);
}

/**
 * Converts a reporting preset into ISO calendar boundaries in the selected
 * business timezone. Raw event timestamps remain UTC; callers compare them
 * against the resulting local-day boundaries.
 */
export function resolveDateRange(
  presetInput: string | undefined,
  options: { from?: string; to?: string; timeZone?: string; now?: Date } = {},
): ResolvedDateRange {
  const preset = (["today", "week", "month", "last30", "custom", "all"].includes(presetInput || "")
    ? presetInput
    : "last30") as DateRangePreset;
  const today = dateParts(options.now || new Date(), options.timeZone || "Asia/Shanghai");

  if (preset === "all") return { preset, from: "", to: "", label: "全部时间" };
  if (preset === "today") return { preset, from: today, to: today, label: "今天" };
  if (preset === "week") return { preset, from: mondayOfWeek(today), to: today, label: "本周" };
  if (preset === "month") return { preset, from: monthStart(today), to: today, label: "本月" };
  if (preset === "custom") {
    return {
      preset,
      from: validDay(options.from),
      to: validDay(options.to),
      label: "自定义范围",
    };
  }
  return { preset: "last30", from: shiftDate(today, -29), to: today, label: "最近 30 天" };
}

export function parsePositiveInt(value: string | undefined, fallback = 1) {
  const parsed = Number(value || fallback);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function paginationPageSize(value: string | undefined, fallback = 25) {
  const parsed = Number(value || fallback);
  return [20, 25, 50, 100].includes(parsed) ? parsed : fallback;
}
