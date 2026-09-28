import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { OrdersList } from "./orders-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account/orders");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-h2 text-foreground mb-8 font-bold">Your Orders</h1>
      <OrdersList />
    </div>
  );
}
