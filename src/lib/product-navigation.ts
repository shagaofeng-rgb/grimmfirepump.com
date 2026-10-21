import type { CmsProductCategory } from "@/lib/admin-cms";

export type ProductNavigationGroup = {
  slug: string;
  title: string;
  href: string;
  description: string;
  image: string;
  items: Array<{ title: string; href: string }>;
};

// Historical CMS categories with the same buyer intent share one public group.
const categoryAliases: Record<string, string> = {
  "fire-pump-series": "fire-pump-systems",
  "water-supply-series": "water-supply-systems",
  "sewage-pump-series": "sewage-drainage-pumps",
  "mobile-pump-truck": "mobile-irrigation-solutions",
};

export function publicCategorySlug(slug: string) {
  return categoryAliases[slug] || slug;
}

export function publicProductCategory(
  categoryId: string,
  categories: Map<string, CmsProductCategory>,
): CmsProductCategory | undefined {
  let category = categories.get(categoryId);
  const seen = new Set<string>();
  while (category?.parentId) {
    if (seen.has(category.id) || !category.enabled) return undefined;
    seen.add(category.id);
    category = categories.get(category.parentId);
  }
  return category?.enabled ? category : undefined;
}

export function buildProductNavigation(
  categories: CmsProductCategory[],
  products: Array<{ slug: string; title: string; image: string; groupSlug: string }>,
): ProductNavigationGroup[] {
  const activeCategories = categories
    .filter((category) => category.enabled && !category.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const bySlug = new Map(activeCategories.map((category) => [category.slug, category]));
  const groups = new Map<string, ProductNavigationGroup>();

  for (const category of activeCategories) {
    const slug = publicCategorySlug(category.slug);
    if (groups.has(slug)) continue;
    const representative = bySlug.get(slug) || category;
    groups.set(slug, {
      slug,
      title: representative.name,
      href: `/products?group=${encodeURIComponent(slug)}`,
      description: representative.summary || representative.description,
      image: "",
      items: [],
    });
  }

  for (const product of products) {
    const group = groups.get(product.groupSlug);
    if (!group) continue;
    group.items.push({ title: product.title, href: `/products/${product.slug}` });
    if (!group.image) group.image = product.image;
  }

  return [...groups.values()];
}
