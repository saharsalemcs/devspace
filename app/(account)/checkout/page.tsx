import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function CheckoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/checkout");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-h2 text-foreground mb-8 font-bold">Checkout</h1>
    </div>
  );
}
