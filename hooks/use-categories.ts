"use client";

import { useQuery } from "@tanstack/react-query";

import { CATALOG_STALE_TIME } from "@/lib/query-config";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export const categoriesQueryKey = ["categories"] as const;

/* `fetchCategories` is defined locally and not exported for server-side use. Categories are purely 
 for client-side sidebar navigation/filtering, so they don't require server prefetching. */

async function fetchCategories(): Promise<CategoryRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
    staleTime: CATALOG_STALE_TIME,
  });
}
