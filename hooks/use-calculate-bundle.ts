"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { fetchBundleTotal } from "@/lib/queries/bundle";
import { createClient } from "@/lib/supabase/client";

// design-system.md § 3.4.1 / task-breakdown.md § 6.3 — debounce RPC calls
// on selection changes so rapid slot swaps don't fire a request per click.
const BUNDLE_DEBOUNCE_MS = 300;

export function useCalculateBundle(productIds: string[]) {
  const [debouncedIds, setDebouncedIds] = useState(productIds);
  const idsKey = productIds.join(",");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedIds(productIds), BUNDLE_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return useQuery({
    queryKey: ["bundle-total", debouncedIds],
    queryFn: () => fetchBundleTotal(createClient(), debouncedIds),
    enabled: debouncedIds.length > 0,
    placeholderData: keepPreviousData,
  });
}
