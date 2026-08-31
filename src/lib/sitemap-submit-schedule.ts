export const GOOGLE_SITEMAP_SUBMIT_INTERVAL_MS = 72 * 60 * 60 * 1000;

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
  intervalMs = GOOGLE_SITEMAP_SUBMIT_INTERVAL_MS,
) {
  const previous = getLastGoogleSubmissionWindowAt(runs);
  return previous === null || now - previous >= intervalMs;
}

export function getNextGoogleSubmissionAt(
  runs: SubmissionRun[],
  now = Date.now(),
  intervalMs = GOOGLE_SITEMAP_SUBMIT_INTERVAL_MS,
) {
  const previous = getLastGoogleSubmissionWindowAt(runs);
  return new Date(previous === null ? now : previous + intervalMs).toISOString();
}
