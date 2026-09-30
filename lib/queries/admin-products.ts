import type { SupabaseClient } from "@supabase/supabase-js";

import { slugify } from "@/lib/slugify";
import { deleteProductImage } from "@/lib/storage/product-images";
import type { AdminProductInput } from "@/lib/schemas/admin-product"; // adjust the path if your file lives elsewhere
import type { Database } from "@/types/database";

// Thrown when a product can't be hard-deleted because past orders reference it.
// A dedicated class lets the UI tell this expected case apart from real failures.
export class ProductInUseError extends Error {
  constructor() {
    super(
      "This product is part of existing orders and can't be deleted. Deactivate it instead.",
    );
    this.name = "ProductInUseError";
  }
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  image_url: string;
  category: { id: string; name: string } | null;
}

// Full row (all columns) — used by the edit form.
export type AdminProductDetail =
  Database["public"]["Tables"]["products"]["Row"];

export function adminProductsQueryKey(search: string) {
  return ["admin-products", search] as const;
}

export function adminProductQueryKey(id: string) {
  return ["admin-product", id] as const;
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

  // % and _ are LIKE wildcards: escape them so searching "100%" is literal.
  const term = search.trim().replace(/[\\%_]/g, "\\$&");
  if (term) {
    query = query.ilike("name", `%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// maybeSingle(): returns null when not found (page can call notFound())
// instead of throwing like .single() does.
// Admin RLS ("Admins can view all products") lets this see inactive products too.
export async function fetchAdminProductById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<AdminProductDetail | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Form gives "" for an empty textarea; the DB column is nullable text.
// Kept in one place so create and update can't drift apart.
function toDbPayload(values: AdminProductInput) {
  return { ...values, description: values.description || null };
}

// products.slug is UNIQUE (Postgres error 23505). PostgREST puts the column
// in `details`: 'Key (slug)=(gaming-chair) already exists.'
function isSlugConflict(error: { code?: string; details?: string | null }) {
  return error.code === "23505" && (error.details ?? "").includes("(slug)");
}

const MAX_SLUG_ATTEMPTS = 3;

export async function createProduct(
  supabase: SupabaseClient<Database>,
  values: AdminProductInput,
): Promise<{ id: string; slug: string }> {
  // Fallback in case slugify strips everything (e.g. an all-Arabic name).
  const base = slugify(values.name) || "product";

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug =
      attempt === 0
        ? base
        : `${base}-${Math.random().toString(36).slice(2, 6)}`;

    const { data, error } = await supabase
      .from("products")
      .insert({ ...toDbPayload(values), slug })
      .select("id, slug")
      .single();

    if (!error) return data;
    if (!isSlugConflict(error)) throw error; // some other failure — don't retry
  }

  throw new Error("Could not generate a unique slug. Try a different name.");
}

// Deliberately does NOT send `slug`: it is set once at creation and never
// changes, so old /products/<slug> links keep working.
export async function updateProduct(
  supabase: SupabaseClient<Database>,
  id: string,
  values: AdminProductInput,
): Promise<{ id: string; slug: string }> {
  // .single() also catches "RLS blocked the update": 0 rows come back
  // and it throws, instead of silently succeeding.
  const { data, error } = await supabase
    .from("products")
    .update(toDbPayload(values))
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) throw error;
  return data;
}

export async function updateProductActive(
  supabase: SupabaseClient<Database>,
  productId: string,
  isActive: boolean,
): Promise<void> {
  // .select().single(): if RLS blocks the update, 0 rows come back and this
  // throws instead of silently "succeeding" (the optimistic switch would
  // otherwise stay flipped on something that never saved).
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)
    .select("id")
    .single();

  if (error) throw error;
}

export async function deleteProduct(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<void> {
  // DELETE ... RETURNING: we get the deleted row back, so we know which image
  // files to clean up without a separate read first. .single() also throws if
  // RLS blocked the delete (0 rows) instead of silently succeeding.
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .select("image_url, images")
    .single();

  // order_items.product_id is ON DELETE RESTRICT (FK violation = 23503):
  // a product that appears in any past order can't be hard-deleted.
  if (error?.code === "23503") throw new ProductInUseError();
  if (error) throw error;

  // Only after the row is really gone. Best-effort: a failed cleanup leaves an
  // orphan file, which must not turn a successful delete into an error.
  void Promise.allSettled(
    [data.image_url, ...data.images].map((url) =>
      deleteProductImage(supabase, url),
    ),
  );
}
