import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database";
import type { CartLineItem } from "@/stores/cart-store";

/** Local cart lines, shaped for the `merge_cart_items` RPC (§ 4 / 007_merge_cart_items.sql). */
export interface CartMergeInput {
  product_id: string;
  bundle_id: string | null;
  quantity: number;
}

export function toCartMergeInput(items: CartLineItem[]): CartMergeInput[] {
  return items.map((item) => ({
    product_id: item.productId,
    bundle_id: item.bundleId,
    quantity: item.quantity,
  }));
}

// Sums quantities on (product_id, bundle_id) conflict — see db-schema.md § 4.
export async function mergeCartItems(
  supabase: SupabaseClient<Database>,
  items: CartLineItem[],
) {
  if (items.length === 0) return;

  const { error } = await supabase.rpc("merge_cart_items", {
    p_items: toCartMergeInput(items) as unknown as Json,
  });

  if (error) throw error;
}

// Joins products for the display fields cart_items itself doesn't store
// (name, slug, price, image_url) — see db-schema.md § 4.
export async function fetchDbCart(
  supabase: SupabaseClient<Database>,
): Promise<CartLineItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("quantity, bundle_id, product:products(id, name, slug, price, image_url)")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((row) => row.product !== null)
    .map((row) => ({
      productId: row.product!.id,
      name: row.product!.name,
      slug: row.product!.slug,
      price: row.product!.price,
      imageUrl: row.product!.image_url,
      quantity: row.quantity,
      bundleId: row.bundle_id,
    }));
}
