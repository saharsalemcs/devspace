import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  image_url: string;
  category: { id: string; name: string } | null;
}

export function adminProductsQueryKey(search: string) {
  return ["admin-products", search] as const;
}

export async function fetchAdminProducts(
  supabase: SupabaseClient<Database>,
  search: string,
): Promise<AdminProduct[]> {
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, price, is_active, image_url, category:categories(id, name)",
    )
    .order("created_at", { ascending: false });

  const term = search.trim();
  if (term) {
    query = query.ilike("name", `%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateProductActive(
  supabase: SupabaseClient<Database>,
  productId: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);

  if (error) throw error;
}

export async function deleteProduct(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
}
