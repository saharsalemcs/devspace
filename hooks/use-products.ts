"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { CATALOG_STALE_TIME } from "@/lib/query-config";
import {
  fetchProducts,
  PRODUCTS_PAGE_SIZE,
  productsQueryKey,
  type Product,
  type ProductsPage,
} from "@/lib/queries/products";
import type { ProductFilters, ProductSort } from "@/lib/schemas/product";
import { createClient } from "@/lib/supabase/client";

export type { ProductFilters, ProductSort, Product, ProductsPage };
export { PRODUCTS_PAGE_SIZE, productsQueryKey }; // re-export

export function useProducts(
  filters: ProductFilters,
  sort: ProductSort,
  page: number,
) {
  return useQuery({
    queryKey: productsQueryKey(filters, sort, page),
    queryFn: () => fetchProducts(createClient(), filters, sort, page),
    staleTime: CATALOG_STALE_TIME,
    // Keeps the current page's rows on screen while the next page loads,
    // instead of flashing a loading state on every "Next" click.
    placeholderData: keepPreviousData,
  });
}
