import { notFound } from "next/navigation";
import { z } from "zod";

import { fetchOrderDetail } from "@/lib/queries/orders";
import { createClient } from "@/lib/supabase/server";
import { AdminOrderDetail } from "./admin-order-detail";
import { requireAdmin } from "@/lib/supabase/auth";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  if (!z.uuid().safeParse(id).success) notFound();

  const order = await fetchOrderDetail(await createClient(), id);
  if (!order) notFound();

  return <AdminOrderDetail initialOrder={order} />;
}
