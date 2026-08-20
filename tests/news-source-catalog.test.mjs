import assert from "node:assert/strict";
import test from "node:test";
import { parseSourceCatalog, validateCatalog } from "../src/lib/news/source-catalog.ts";

test("requires exactly 300 ordered catalog entries and five preserved groups", () => {
  const markdown = Array.from({ length: 300 }, (_, index) => `${index + 1}. Source ${index + 1} - https://source-${index + 1}.example.com/`).join("\n");
  const result = validateCatalog(parseSourceCatalog(markdown));
  assert.equal(result.valid, true);
  assert.deepEqual(Object.values(result.groupCounts), [60, 60, 60, 60, 60]);
});

test("does not silently accept missing source entries", () => {
  const markdown = Array.from({ length: 299 }, (_, index) => `${index + 1}. Source ${index + 1} - https://source-${index + 1}.example.com/`).join("\n");
  assert.equal(validateCatalog(parseSourceCatalog(markdown)).valid, false);
});