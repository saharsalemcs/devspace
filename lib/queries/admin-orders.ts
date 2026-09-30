import type { SupabaseClient } from "@supabase/supabase-js";

import type { OrderStatus } from "@/lib/order-status";
import type { Database } from "@/types/database";

export type AdminOrderStatusFilter = OrderStatus | "all";

export interface AdminOrderListItem {
  id: string;
  created_at: string;
  status: string;
  total_price: number;
  customer_name: string;
  customer_phone: string;
  item_count: number;
}

export const ADMIN_ORDERS_QUERY_ROOT = "admin-orders";

export function adminOrderQueryKey(orderId: string) {
  return [ADMIN_ORDERS_QUERY_ROOT, "detail", orderId] as const;
}

export function adminOrdersQueryKey(status: AdminOrderStatusFilter) {
  return [ADMIN_ORDERS_QUERY_ROOT, status] as const;
}

const ORDERS_LIMIT = 100;

export async function fetchAdminOrders(
  supabase: SupabaseClient<Database>,
  status: AdminOrderStatusFilter,
): Promise<AdminOrderListItem[]> {
  let query = supabase
    .from("orders")
    .select(
      "id, created_at, status, total_price, customer_name, customer_phone, order_items(count)",
    )
    .order("created_at", { ascending: false })
    .limit(ORDERS_LIMIT);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map(({ order_items, ...order }) => ({
    ...order,
    item_count: order_items[0]?.count ?? 0,
  }));
}

export async function updateOrderStatus(
  supabase: SupabaseClient<Database>,
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("id")
    .single();

  if (error) throw error;
}
