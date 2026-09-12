export type DateRangePreset = "today" | "week" | "month" | "last30" | "custom" | "all";

export type ResolvedDateRange = {
  preset: DateRangePreset;
  from: string;
  to: string;
  label: string;
};

function dateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
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
      from: options.from || "",
      to: options.to || "",
      label: options.from || options.to ? "自定义范围" : "自定义范围",
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
