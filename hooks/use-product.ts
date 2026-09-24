"use client";

import { useQuery } from "@tanstack/react-query";

import { CATALOG_STALE_TIME } from "@/lib/query-config";
import { createClient } from "@/lib/supabase/client";
import type { CategoryRow } from "@/types/models";
import type { ProductRow } from "@/types/models";

export interface ProductDetail extends ProductRow {
  category: Pick<CategoryRow, "id" | "name" | "slug"> | null;
  average_rating: number | null;
  review_count: number | null;
}

export const productQueryKey = (slug: string) => ["product", slug] as const;

export async function fetchProduct(
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(id, name, slug), product_rating_stats(average_rating, review_count)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { product_rating_stats, ...product } = data;
  const stats = product_rating_stats?.[0];

  return {
    ...product,
    average_rating: stats?.average_rating ?? null,
    review_count: stats?.review_count ?? null,
  };
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productQueryKey(slug),
    queryFn: () => fetchProduct(slug),
    staleTime: CATALOG_STALE_TIME,
    enabled: Boolean(slug),
  });
}
