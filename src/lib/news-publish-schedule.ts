export type NewsPublishSchedule = {
  due: boolean;
  overdue: boolean;
  lastSuccessAt: string | null;
  dueAt: string | null;
  eligibleAt: string | null;
  elapsedHours: number | null;
};

export function getNewsPublishSchedule(
  lastSuccessAt: string | undefined,
  now = Date.now(),
  intervalHours = 48,
  graceMinutes = 5,
  overdueHours = 4,
): NewsPublishSchedule {
  const lastSuccessMs = lastSuccessAt ? Date.parse(lastSuccessAt) : Number.NaN;
  if (!Number.isFinite(lastSuccessMs)) {
    return {
      due: true,
      overdue: false,
      lastSuccessAt: null,
      dueAt: null,
      eligibleAt: null,
      elapsedHours: null,
    };
  }

  const intervalMs = Math.max(1, intervalHours) * 3_600_000;
  const graceMs = Math.min(Math.max(graceMinutes, 0), 60) * 60_000;
  const overdueMs = Math.max(overdueHours, 0) * 3_600_000;
  const dueAtMs = lastSuccessMs + intervalMs;
  const elapsedMs = Math.max(0, now - lastSuccessMs);

  return {
    due: now + graceMs >= dueAtMs,
    overdue: now > dueAtMs + overdueMs,
    lastSuccessAt: new Date(lastSuccessMs).toISOString(),
    dueAt: new Date(dueAtMs).toISOString(),
    eligibleAt: new Date(dueAtMs - graceMs).toISOString(),
    elapsedHours: elapsedMs / 3_600_000,
  };
}
