"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  adminProductsQueryKey,
  fetchAdminProducts,
} from "@/lib/queries/admin-products";
import { createClient } from "@/lib/supabase/client";

export { adminProductsQueryKey };

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

export function useAdminProducts(search: string) {
  const term = useDebouncedValue(search.trim(), 300);

  return useQuery({
    queryKey: adminProductsQueryKey(term),
    queryFn: () => fetchAdminProducts(createClient(), term),

    placeholderData: keepPreviousData,
  });
}
