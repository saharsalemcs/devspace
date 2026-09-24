"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchProduct, productQueryKey } from "@/lib/queries/product";
import { CATALOG_STALE_TIME } from "@/lib/query-config";
import { createClient } from "@/lib/supabase/client";

export type { ProductDetail } from "@/lib/queries/product";
export { productQueryKey };

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productQueryKey(slug),
    queryFn: () => fetchProduct(createClient(), slug),
    staleTime: CATALOG_STALE_TIME,
    enabled: Boolean(slug),
  });
}
