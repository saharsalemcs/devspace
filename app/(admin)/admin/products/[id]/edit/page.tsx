import { notFound } from "next/navigation";
import { z } from "zod";

import { fetchAdminProductById } from "@/lib/queries/admin-products";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../../product-form";
import { requireAdmin } from "@/lib/supabase/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  // A non-uuid id would make Postgres throw "invalid input syntax for type uuid"
  // (=> 500 page) instead of a clean 404.
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const [product, categoriesResult] = await Promise.all([
    fetchAdminProductById(supabase, id),
    supabase.from("categories").select("id, name").order("display_order"),
  ]);

  if (!product) notFound();
  if (categoriesResult.error) throw categoriesResult.error;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h3 text-foreground font-semibold">Edit product</h1>
      <ProductForm categories={categoriesResult.data ?? []} product={product} />
    </div>
  );
}
