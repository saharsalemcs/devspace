import type { ProductSort } from "@/lib/schemas/product";

// Small, pure URLSearchParams helpers shared by the /products filter
// controls (search, category checkboxes, price range, sort) so each one
// can read the current URL, patch its own slice, and push the result
// without stepping on the params the other controls own.

export type ProductParamUpdates = Partial<{
  q: string | undefined;
  minPrice: string | undefined;
  maxPrice: string | undefined;
  sort: ProductSort | undefined;
}>;

function toQueryString(params: URLSearchParams): string {
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Patches one or more scalar params, always resetting pagination. */
export function withProductParams(
  current: URLSearchParams,
  updates: ProductParamUpdates,
): string {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, value);
  }
  next.delete("page");
  return toQueryString(next);
}

/** Adds/removes a single category id from the repeated `category` param. */
export function toggleCategoryParam(
  current: URLSearchParams,
  categoryId: string,
): string {
  const next = new URLSearchParams(current);
  const selected = new Set(next.getAll("category"));
  if (selected.has(categoryId)) selected.delete(categoryId);
  else selected.add(categoryId);

  next.delete("category");
  for (const id of selected) next.append("category", id);
  next.delete("page");
  return toQueryString(next);
}

/** Sets the `page` param, leaving every other filter untouched. */
export function withPageParam(current: URLSearchParams, page: number): string {
  const next = new URLSearchParams(current);
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  return toQueryString(next);
}
