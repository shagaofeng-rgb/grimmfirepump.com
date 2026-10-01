// Monday 03:00 UTC is Monday 11:00 Asia/Shanghai.
export const GOOGLE_SITEMAP_SUBMIT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

function weeklyWindow(now: number) {
  const date = new Date(now);
  date.setUTCHours(3, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.getTime();
}

type SubmissionRun = {
  finishedAt?: string;
  createdAt?: string;
  trigger?: string;
  googleSubmissionWindow?: boolean;
};

function timestamp(run: SubmissionRun) {
  const value = run.finishedAt || run.createdAt || "";
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getLastGoogleSubmissionWindowAt(runs: SubmissionRun[]) {
  const current = runs
    .filter((run) => run.googleSubmissionWindow === true)
    .map(timestamp)
    .filter(Boolean);
  if (current.length) return Math.max(...current);

  // Before googleSubmissionWindow was recorded, every production cron invocation
  // represented the old three-day submission window. Keep the latest one as the
  // migration anchor so a deployment cannot trigger an immediate duplicate.
  const legacy = runs
    .filter((run) => run.googleSubmissionWindow === undefined && run.trigger === "cron")
    .map(timestamp)
    .filter(Boolean);
  return legacy.length ? Math.max(...legacy) : null;
}

export function isGoogleSubmissionDue(
  runs: SubmissionRun[],
  now = Date.now(),
) {
  const previous = getLastGoogleSubmissionWindowAt(runs);
  const window = weeklyWindow(now);
  return new Date(now).getUTCDay() === 1 && now >= window && (previous === null || previous < window);
}

export function getNextGoogleSubmissionAt(
  runs: SubmissionRun[],
  now = Date.now(),
) {
  const window = weeklyWindow(now);
  const next = now < window || isGoogleSubmissionDue(runs, now) ? window : window + GOOGLE_SITEMAP_SUBMIT_INTERVAL_MS;
  return new Date(next).toISOString();
}
