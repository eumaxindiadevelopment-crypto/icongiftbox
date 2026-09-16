// Builds the canonical, SEO-friendly URL for a category or product, for the
// admin's "View on site" links. Mirrored in frontend/src/lib/seoUrl.ts —
// keep the two in sync.

export function buildCategoryUrl(category) {
  if (!category?.slug) return '/shop'
  // Top-level categories live at the bare root (e.g. /customised-gifts).
  // Child categories also live at the bare root (e.g. /diwali-gifts/festive-gifts/).
  // This collides at the routing level with the 2-segment
  // /:categorySlug/:productSlug product URL — the frontend's /:slug1/:slug2
  // route resolves that ambiguity at runtime (see SeoUrlLevel2.tsx).
  return category.parent?.slug
    ? `/${category.parent.slug}/${category.slug}/`
    : `/${category.slug}/`
}

export function buildProductUrl(product) {
  const idOrSlug = product?.slug || product?._id
  if (!idOrSlug) return '#'
  const cat = product?.primaryCategory
  // No primary category yet (e.g. uncategorized product) — fall back to
  // the flat legacy route, which stays registered for exactly this case.
  if (!cat?.slug) return `/product/${idOrSlug}`
  return cat.parent?.slug
    ? `/${cat.parent.slug}/${cat.slug}/${idOrSlug}`
    : `/${cat.slug}/${idOrSlug}`
}
