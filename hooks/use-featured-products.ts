"use client";

import { useQuery } from "@tanstack/react-query";

import {
  featuredProductsQueryKey,
  fetchFeaturedProducts,
} from "@/lib/queries/featured-products";
import { CATALOG_STALE_TIME } from "@/lib/query-config";
import { createClient } from "@/lib/supabase/client";

export function useFeaturedProducts() {
  return useQuery({
    queryKey: featuredProductsQueryKey,
    queryFn: () => fetchFeaturedProducts(createClient()),
    staleTime: CATALOG_STALE_TIME,
  });
}
