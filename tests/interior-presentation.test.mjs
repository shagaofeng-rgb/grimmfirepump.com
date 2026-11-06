import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { boundedQuery, catalogHref, displayParameter, keyParameters } from "../src/lib/catalog-presentation.ts";
import { interiorProductPhoto } from "../src/lib/interior-product-images.ts";
import { estimateWaterPumpPower } from "../src/lib/pump-power.ts";

test("legacy pump parameters preserve values and distinguish pressure from head", () => {
  assert.deepEqual(displayParameter({ name: "Head", value: "3-15Bar", unit: "" }), { name: "Pressure", value: "3-15", unit: "bar" });
  assert.deepEqual(displayParameter({ name: "Head", value: "50", unit: "m" }), { name: "Head", value: "50", unit: "m" });
  assert.deepEqual(displayParameter({ name: "Flow", value: "20 L/s", unit: "L/s" }), { name: "Flow", value: "20", unit: "L/s" });
  assert.deepEqual(displayParameter({ name: "Material", value: "HT200, SS304, Bronze", unit: "" }), { name: "Material", value: "HT200, SS304, Bronze", unit: "" });
});

test("key specs use existing values without repeating an equivalent label", () => {
  assert.deepEqual(keyParameters([
    { name: "Head", value: "3-15Bar", unit: "" },
    { name: "Pressure", value: "0.3~1.5MPa", unit: "" },
    { name: "Flow", value: "5-400L/s", unit: "" },
    { name: "Caliber", value: "65-250mm", unit: "" },
  ]).map((item) => item.name), ["Flow", "Pressure", "Nominal diameter"]);
});

test("catalog query handling bounds untrusted input and builds stable view URLs", () => {
  assert.equal(boundedQuery(["EDJ", "Diesel"]), "");
  assert.equal(boundedQuery("  long model  ", 4), "long");
  assert.equal(catalogHref("/products", { group: "water supply", q: "A&B", sort: "" }), "/products?group=water+supply&q=A%26B");
});

test("optimized images only replace known original files, never CMS uploads", () => {
  const source = "/assets/synced/products/edj-fire-pump-set.jpg";
  const derivative = interiorProductPhoto(source);
  assert.notEqual(derivative, source);
  assert.ok(existsSync(new URL(`../public${derivative}`, import.meta.url)));
  const uploaded = "https://test.public.blob.vercel-storage.com/products/new-edj.webp";
  assert.equal(interiorProductPhoto(uploaded), uploaded);
});

test("pump calculator differentiates hydraulic and shaft power and rejects invalid input", () => {
  const estimate = estimateWaterPumpPower(500, 90, 65);
  assert.equal(estimate.hydraulicKw.toFixed(1), "27.8");
  assert.equal(estimate.shaftKw.toFixed(1), "42.8");
  assert.equal(estimateWaterPumpPower(500, 90, 0), null);
  assert.equal(estimateWaterPumpPower(Infinity, 90, 65), null);
});
