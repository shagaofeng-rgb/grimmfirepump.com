import assert from "node:assert/strict";
import test from "node:test";
import { getNewsPublishSchedule } from "../src/lib/news-publish-schedule.ts";

const lastSuccess = "2026-08-27T12:31:43.000Z";

test("opens the 48-hour window within the configured cron tolerance", () => {
  const now = Date.parse("2026-08-29T12:30:50.000Z");
  const schedule = getNewsPublishSchedule(lastSuccess, now, 48, 5);
  assert.equal(schedule.due, true);
  assert.equal(schedule.overdue, false);
});

test("does not open the publication window too early", () => {
  const now = Date.parse("2026-08-29T12:20:00.000Z");
  const schedule = getNewsPublishSchedule(lastSuccess, now, 48, 5);
  assert.equal(schedule.due, false);
  assert.equal(schedule.eligibleAt, "2026-08-29T12:26:43.000Z");
});

test("marks a publication window overdue after four hours", () => {
  const now = Date.parse("2026-08-29T16:31:44.000Z");
  const schedule = getNewsPublishSchedule(lastSuccess, now, 48, 5);
  assert.equal(schedule.due, true);
  assert.equal(schedule.overdue, true);
});

test("publishes immediately when there is no verified delivery", () => {
  const schedule = getNewsPublishSchedule(undefined, Date.now(), 48, 5);
  assert.equal(schedule.due, true);
  assert.equal(schedule.lastSuccessAt, null);
});
