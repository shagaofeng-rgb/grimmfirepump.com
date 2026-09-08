import assert from "node:assert/strict";
import test from "node:test";
import { resolveDateRange } from "../src/lib/admin-listing.ts";
import { getVisitorProfiles, getVisitorSessions } from "../src/lib/visitor-analytics.ts";

test("date presets respect the configured reporting timezone", () => {
  const today = resolveDateRange("today", { timeZone: "Asia/Shanghai", now: new Date("2026-09-07T16:30:00.000Z") });
  assert.deepEqual(today, { preset: "today", from: "2026-09-08", to: "2026-09-08", label: "今天" });
  const week = resolveDateRange("week", { timeZone: "Asia/Shanghai", now: new Date("2026-09-07T16:30:00.000Z") });
  assert.equal(week.from, "2026-09-07");
  assert.equal(week.to, "2026-09-08");
});

test("visitor profiles preserve separate sessions and chronological journeys", () => {
  const events = [
    { id: "1", createdAt: "2026-09-08T01:00:00Z", event: "page_view", visitorId: "visitor-a", sessionId: "session-1", visitNumber: 1, path: "/", trafficType: "real", country: "China", channel: "Direct" },
    { id: "2", createdAt: "2026-09-08T01:01:00Z", event: "page_view", visitorId: "visitor-a", sessionId: "session-1", visitNumber: 1, path: "/products/edj-fire-pump-set", trafficType: "real", country: "China", channel: "Direct" },
    { id: "3", createdAt: "2026-09-09T01:00:00Z", event: "inquiry_submit", visitorId: "visitor-a", sessionId: "session-2", visitNumber: 2, path: "/contact", trafficType: "real", country: "China", channel: "Organic search" },
    { id: "4", createdAt: "2026-09-09T01:00:00Z", event: "page_view", visitorId: "test", sessionId: "test-session", visitNumber: 1, path: "/", trafficType: "test" },
  ];
  const profiles = getVisitorProfiles(events, { traffic: "real" });
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].sessions, 2);
  assert.equal(profiles[0].visits, 2);
  assert.equal(profiles[0].conversions, 1);
  const sessions = getVisitorSessions(events, "visitor-a", { traffic: "real" });
  assert.equal(sessions.length, 2);
  assert.equal(sessions[1].entryPath, "/");
  assert.equal(sessions[1].exitPath, "/products/edj-fire-pump-set");
});
