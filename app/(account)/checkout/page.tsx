import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: proxy.ts already protects this route, but a
  // Server Component should never assume a null user can't reach here.
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
      <CheckoutForm
        initialFullName={profile?.full_name ?? ""}
        initialPhone={profile?.phone ?? ""}
      />
    </div>
  );
}
