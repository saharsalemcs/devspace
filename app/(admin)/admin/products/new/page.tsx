import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../product-form"; // adjust to where you put the form
import { requireAdmin } from "@/lib/supabase/auth";

export default async function NewProductPage() {
  // Layouts don't re-run on client navigation, so each admin page verifies too.
  await requireAdmin();

  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("display_order");
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h3 text-foreground font-semibold">New product</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
