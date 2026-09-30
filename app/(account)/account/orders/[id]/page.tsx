import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fetchOrderDetail } from "@/lib/queries/orders";
import { OrderDetailView } from "@/components/features/orders/order-detail-view";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/account/orders/${id}`);
  }

  const order = await fetchOrderDetail(supabase, id);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <OrderDetailView order={order} />
    </div>
  );
}
