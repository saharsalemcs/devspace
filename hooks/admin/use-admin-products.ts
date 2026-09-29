"use client";

import { useQuery } from "@tanstack/react-query";

import {
  adminProductsQueryKey,
  fetchAdminProducts,
} from "@/lib/queries/admin-products";
import { createClient } from "@/lib/supabase/client";

export { adminProductsQueryKey };

export function useAdminProducts(search: string) {
  return useQuery({
    queryKey: adminProductsQueryKey(search),
    queryFn: () => fetchAdminProducts(createClient(), search),
  });
}
