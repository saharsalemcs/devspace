// Generates a URL-safe slug from a product name. Used once, at creation
// time, by createProduct() — never re-derived on update, so editing a
// product's name later never changes (and breaks) its existing
// /products/[slug] URL.
export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
