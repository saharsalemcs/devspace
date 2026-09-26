import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export interface BundleTotal {
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

// Server-authoritative Desk Builder pricing — db-schema.md § 3.3. Never
// computed client-side; the client only sends the selected product IDs.
export async function fetchBundleTotal(
  supabase: SupabaseClient<Database>,
  productIds: string[],
): Promise<BundleTotal> {
  const { data, error } = await supabase.rpc("calculate_bundle_total", {
    product_ids: productIds,
  });

  if (error) throw error;

  const row = data?.[0];

  return {
    subtotal: row?.subtotal ?? 0,
    discount: row?.discount ?? 0,
    total: row?.total ?? 0,
    itemCount: row?.item_count ?? 0,
  };
}
