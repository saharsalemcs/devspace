import type { QueryClient } from "@tanstack/react-query";

import { adminProductQueryKey } from "@/lib/queries/admin-products";
import { ADMIN_REVIEWS_QUERY_ROOT } from "@/lib/queries/admin-reviews";

const CATALOG_QUERY_ROOTS = new Set([
  "products",
  "featured-products",
  "product",
  "reviews",
]);

export function invalidateProductQueries(
  queryClient: QueryClient,
  productId?: string,
): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
    productId
      ? queryClient.invalidateQueries({
          queryKey: adminProductQueryKey(productId),
        })
      : undefined,

    queryClient.invalidateQueries({
      predicate: (query) => CATALOG_QUERY_ROOTS.has(String(query.queryKey[0])),
    }),
  ]);
}

export function invalidateReviewQueries(
  queryClient: QueryClient,
): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: [ADMIN_REVIEWS_QUERY_ROOT] }),
    queryClient.invalidateQueries({
      predicate: (query) => CATALOG_QUERY_ROOTS.has(String(query.queryKey[0])),
    }),
  ]);
}
