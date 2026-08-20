import assert from "node:assert/strict";
import test from "node:test";
import { validateNewsQuality } from "../src/lib/news/quality-gates.ts";

const body = Array.from({ length: 1120 }, () => "verified").join(" ");
const base = { title: "Data center fire pump planning", body, productSlug: "edj-fire-pump-set", industry: "data-center", scenario: "redundant-fire-water", sources: [{ title: "Official report", url: "https://example.com/report", publisher: "Example", publishedAt: "2026-08-20", verified: true }], images: [{ src: "/assets/products/edj-package.webp", sourceType: "owned-product", licenseBasis: "owned", verifiedAt: "2026-08-20T00:00:00.000Z" }], factLocks: [], previousCombinations: [], previousTitles: [] };
test("accepts a fully sourced, within-range draft", () => assert.equal(validateNewsQuality(base).passed, true));
test("rejects an AI disclosure and a reused combination", () => {
  const result = validateNewsQuality({ ...base, body: `${body} As an AI`, previousCombinations: ["edj fire pump set|data center|redundant fire water"] });
  assert.equal(result.passed, false); assert.equal(result.failures.length >= 2, true);
});