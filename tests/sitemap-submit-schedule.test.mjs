import assert from "node:assert/strict";
import test from "node:test";
import {
  GOOGLE_SITEMAP_SUBMIT_INTERVAL_MS,
  getLastGoogleSubmissionWindowAt,
  getNextGoogleSubmissionAt,
  isGoogleSubmissionDue,
} from "../src/lib/sitemap-submit-schedule.ts";

test("a site with no submission history is due immediately", () => {
  assert.equal(isGoogleSubmissionDue([], Date.parse("2026-08-31T03:00:00Z")), true);
});

test("the gate uses a strict 72-hour interval across month boundaries", () => {
  const runs = [{
    trigger: "cron",
    finishedAt: "2026-08-31T03:00:00Z",
    googleSubmissionWindow: true,
  }];
  assert.equal(isGoogleSubmissionDue(runs, Date.parse("2026-09-01T03:00:00Z")), false);
  assert.equal(isGoogleSubmissionDue(runs, Date.parse("2026-09-03T02:59:59Z")), false);
  assert.equal(isGoogleSubmissionDue(runs, Date.parse("2026-09-03T03:00:00Z")), true);
  assert.equal(getNextGoogleSubmissionAt(runs), "2026-09-03T03:00:00.000Z");
});

test("daily non-submission runs do not move the 72-hour anchor", () => {
  const runs = [
    { trigger: "cron", finishedAt: "2026-09-02T03:00:00Z", googleSubmissionWindow: false },
    { trigger: "cron", finishedAt: "2026-09-01T03:00:00Z", googleSubmissionWindow: false },
    { trigger: "cron", finishedAt: "2026-08-31T03:00:00Z", googleSubmissionWindow: true },
  ];
  assert.equal(getLastGoogleSubmissionWindowAt(runs), Date.parse("2026-08-31T03:00:00Z"));
  assert.equal(isGoogleSubmissionDue(runs, Date.parse("2026-09-03T03:00:00Z")), true);
});

test("legacy cron history is retained as the migration anchor", () => {
  const runs = [
    { trigger: "cron", finishedAt: "2026-08-31T03:00:00Z" },
    { trigger: "manual-api", finishedAt: "2026-08-31T08:00:00Z" },
  ];
  assert.equal(getLastGoogleSubmissionWindowAt(runs), Date.parse("2026-08-31T03:00:00Z"));
  assert.equal(isGoogleSubmissionDue(runs, Date.parse("2026-09-01T03:00:00Z")), false);
});

test("the production interval remains exactly 72 hours", () => {
  assert.equal(GOOGLE_SITEMAP_SUBMIT_INTERVAL_MS, 259_200_000);
});
