import assert from "node:assert/strict";
import test from "node:test";
import { resolveDateRange } from "../src/lib/admin-listing.ts";

test("date presets respect the configured reporting timezone", () => {
  const now = new Date("2026-09-07T16:30:00.000Z");
  const today = resolveDateRange("today", { timeZone: "Asia/Shanghai", now });
  assert.deepEqual(today, { preset: "today", from: "2026-09-08", to: "2026-09-08", label: "今天" });

  const week = resolveDateRange("week", { timeZone: "Asia/Shanghai", now });
  assert.equal(week.from, "2026-09-07");
  assert.equal(week.to, "2026-09-08");

  const month = resolveDateRange("month", { timeZone: "Asia/Shanghai", now });
  assert.equal(month.from, "2026-09-01");
  assert.equal(month.to, "2026-09-08");
});

test("custom and all ranges stay explicit", () => {
  const custom = resolveDateRange("custom", { from: "2026-08-03", to: "2026-08-05", timeZone: "Asia/Shanghai" });
  assert.deepEqual(custom, { preset: "custom", from: "2026-08-03", to: "2026-08-05", label: "自定义范围" });

  const all = resolveDateRange("all", { timeZone: "Asia/Shanghai" });
  assert.equal(all.from, "");
  assert.equal(all.to, "");
});
