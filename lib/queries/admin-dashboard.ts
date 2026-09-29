import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export interface AdminDashboardStats {
  totalOrders: number;
  ordersThisMonth: number;
  totalRevenue: number;
  customerCount: number;
  activeProductCount: number;
}

// admin_dashboard_stats() returns a table (single row), same shape as
// calculate_bundle_total — data comes back as an array, unwrap with ?.[0]
// (unlike place_order's scalar uuid return).
export async function fetchAdminDashboardStats(
  supabase: SupabaseClient<Database>,
): Promise<AdminDashboardStats> {
  const { data, error } = await supabase.rpc("admin_dashboard_stats");

  if (error) throw error;

  const row = data?.[0];

  return {
    totalOrders: row?.total_orders ?? 0,
    ordersThisMonth: row?.orders_this_month ?? 0,
    totalRevenue: row?.total_revenue ?? 0,
    customerCount: row?.customer_count ?? 0,
    activeProductCount: row?.active_product_count ?? 0,
  };
}
