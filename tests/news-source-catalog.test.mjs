import assert from "node:assert/strict";
import test from "node:test";
import { parseSourceCatalog, validateCatalog } from "../src/lib/news/source-catalog.ts";

const entries = (count) => Array.from(
  { length: count },
  (_, index) => (index + 1) + ". Source " + (index + 1) + " - https://source-" + (index + 1) + ".example.com/",
).join("\n");

test("requires exactly 300 ordered catalog entries and five preserved groups", () => {
  const result = validateCatalog(parseSourceCatalog(entries(300)));
  assert.equal(result.valid, true);
  assert.deepEqual(Object.values(result.groupCounts), [60, 60, 60, 60, 60]);
});

test("does not silently accept missing source entries", () => {
  assert.equal(validateCatalog(parseSourceCatalog(entries(299))).valid, false);
});

test("records duplicate ordinals for review instead of accepting them", () => {
  const markdown = entries(299) + "\n299. Replacement source - https://replacement.example.com/";
  const result = validateCatalog(parseSourceCatalog(markdown));
  assert.equal(result.valid, false);
  assert.deepEqual(result.duplicateOrdinals, [299]);
});
