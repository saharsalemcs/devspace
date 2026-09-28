import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database";
import type { CartLineItem } from "@/stores/cart-store";
import type { CheckoutInput, ShippingAddress } from "@/lib/schemas/checkout";

export interface PlaceOrderItem {
  product_id: string;
  quantity: number;
  bundle_id: string | null;
}

export function toPlaceOrderItems(items: CartLineItem[]): PlaceOrderItem[] {
  return items.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
    bundle_id: item.bundleId,
  }));
}

export async function placeOrderRpc(
  supabase: SupabaseClient<Database>,
  input: CheckoutInput,
  items: CartLineItem[],
): Promise<string> {
  const { data, error } = await supabase.rpc("place_order", {
    p_items: toPlaceOrderItems(items) as unknown as Json,
    p_shipping: input.shipping as unknown as Json,
    p_payment_method: input.payment_method,
    p_customer_name: input.customer_name,
    p_customer_phone: input.customer_phone,
  });

  if (error) throw error;
  return data as string;
}

export async function clearDbCartAfterOrder(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}

export interface OrderSummary {
  id: string;
  status: string;
  subtotal: number;
  discount_total: number;
  total_price: number;
  created_at: string;
}

export async function fetchOrderSummary(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<OrderSummary | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, subtotal, discount_total, total_price, created_at")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export interface OrderListItem {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  item_count: number;
}

export async function fetchOrders(
  supabase: SupabaseClient<Database>,
): Promise<OrderListItem[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_price, created_at, order_items(count)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(({ order_items, ...order }) => ({
    ...order,
    item_count: order_items?.[0]?.count ?? 0,
  }));
}

export interface OrderItemDetail {
  id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  bundle_id: string | null;
}

export interface OrderDetail {
  id: string;
  status: string;
  subtotal: number;
  discount_total: number;
  total_price: number;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  created_at: string;
  items: OrderItemDetail[];
}

// Full order detail for /account/orders/[id]. Like fetchOrderSummary,
// returns null for both "doesn't exist" and "not yours" (RLS-enforced) —
// the page shows the same not-found state either way.
export async function fetchOrderDetail(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<OrderDetail | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, status, subtotal, discount_total, total_price, payment_method,
       customer_name, customer_phone, shipping_address, created_at,
       order_items(id, product_id, product_name, unit_price, quantity, bundle_id)`,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { order_items, ...order } = data;

  return {
    ...order,
    shipping_address: order.shipping_address as unknown as ShippingAddress,
    items: order_items ?? [],
  };
}
