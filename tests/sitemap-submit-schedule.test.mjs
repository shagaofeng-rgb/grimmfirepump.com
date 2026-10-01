import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { isGoogleSubmissionDue, getNextGoogleSubmissionAt } from "../src/lib/sitemap-submit-schedule.ts";
import { NEWS_AUTOMATION_ENABLED } from "../src/lib/news-automation-policy.ts";

test("only Monday after 11:00 Shanghai is eligible", () => {
  assert.equal(isGoogleSubmissionDue([], Date.parse("2026-10-01T03:00:00Z")), false);
  assert.equal(isGoogleSubmissionDue([], Date.parse("2026-10-05T02:59:59Z")), false);
  assert.equal(isGoogleSubmissionDue([], Date.parse("2026-10-05T03:00:00Z")), true);
  assert.equal(getNextGoogleSubmissionAt([], Date.parse("2026-10-01T03:00:00Z")), "2026-10-05T03:00:00.000Z");
});

test("duplicates are blocked without skipping next Monday", () => {
  const runs = [{ googleSubmissionWindow: true, finishedAt: "2026-10-05T03:05:00Z" }];
  assert.equal(isGoogleSubmissionDue(runs, Date.parse("2026-10-05T04:00:00Z")), false);
  assert.equal(getNextGoogleSubmissionAt(runs, Date.parse("2026-10-05T04:00:00Z")), "2026-10-12T03:00:00.000Z");
  assert.equal(isGoogleSubmissionDue(runs, Date.parse("2026-10-12T03:00:00Z")), true);
});

test("weekly schedule crosses year boundaries", () => {
  assert.equal(getNextGoogleSubmissionAt([], Date.parse("2026-12-31T12:00:00Z")), "2027-01-04T03:00:00.000Z");
});

test("News disabled and production only has Monday SEO cron", () => {
  assert.equal(NEWS_AUTOMATION_ENABLED, false);
  const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url)));
  assert.deepEqual(config.crons, [{ path: "/api/cron/sitemap", schedule: "0 3 * * 1" }]);
});
