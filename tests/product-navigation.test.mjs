import assert from "node:assert/strict";
import test from "node:test";
import { buildProductNavigation, publicCategorySlug, publicProductCategory } from "../src/lib/product-navigation.ts";

const category = (slug, name, sortOrder) => ({
  id: `cat_${slug}`, slug, name, sortOrder, enabled: true, parentId: "",
  summary: `${name} summary`, description: "", coverImage: "",
});

test("published CMS products appear in the six buyer-facing groups", () => {
  const categories = [
    category("fire-pump-series", "Fire Pump Series", 1),
    category("fire-pump-systems", "Fire Pump Systems", 1),
    category("water-supply-systems", "Water Supply Systems", 2),
    category("sewage-drainage-pumps", "Sewage & Drainage Pumps", 3),
    category("mobile-irrigation-solutions", "Mobile & Irrigation Pump Solutions", 4),
    category("pumps", "Pumps", 5),
    category("accessories", "Accessories", 6),
  ];
  const products = categories.map((item) => ({
    slug: `item-${item.slug}`, title: item.name, image: `/images/${item.slug}.webp`,
    groupSlug: publicCategorySlug(item.slug),
  }));
  const groups = buildProductNavigation(categories, products);

  assert.equal(groups.length, 6);
  assert.deepEqual(groups.map((item) => item.title), [
    "Fire Pump Systems", "Water Supply Systems", "Sewage & Drainage Pumps",
    "Mobile & Irrigation Pump Solutions", "Pumps", "Accessories",
  ]);
  assert.equal(groups[0].items.length, 2);
  assert.equal(groups.at(-1).items[0].href, "/products/item-accessories");
  assert.equal(groups.at(-1).image, "/images/accessories.webp");
});

test("enabled empty categories remain visible; disabled and nested categories do not become top-level cards", () => {
  const disabled = { ...category("archived", "Archived", 1), enabled: false };
  const nested = { ...category("child", "Child", 2), parentId: "cat_parent" };
  const groups = buildProductNavigation([disabled, nested, category("pumps", "Pumps", 3), category("accessories", "Accessories", 4)], [
    { slug: "pump-a", title: "Pump A", image: "/a.webp", groupSlug: "pumps" },
  ]);
  assert.deepEqual(groups.map((item) => item.slug), ["pumps", "accessories"]);
  assert.deepEqual(groups[1].items, []);
  assert.equal(groups[1].image, "");
});

test("nested products resolve to their enabled parent and disabled ancestors block publication", () => {
  const parent = category("pumps", "Pumps", 1);
  const child = { ...category("submersible", "Submersible", 2), parentId: parent.id };
  const categories = new Map([parent, child].map((item) => [item.id, item]));
  assert.equal(publicProductCategory(child.id, categories)?.slug, "pumps");
  categories.set(parent.id, { ...parent, enabled: false });
  assert.equal(publicProductCategory(child.id, categories), undefined);
});
