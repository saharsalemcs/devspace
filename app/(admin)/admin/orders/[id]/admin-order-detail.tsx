"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderStatusSelect } from "@/components/features/admin/order-status-select";
import { OrderDetailView } from "@/components/features/orders/order-detail-view";
import { useAdminOrder } from "@/hooks/admin/use-admin-order";
import type { OrderDetail } from "@/lib/queries/orders";

interface AdminOrderDetailProps {
  initialOrder: OrderDetail;
}

function AdminOrderDetail({ initialOrder }: AdminOrderDetailProps) {
  const { data } = useAdminOrder(initialOrder);
  const order = data ?? initialOrder;

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/admin/orders" />}
      >
        <ArrowLeftIcon />
        Orders
      </Button>

      <OrderDetailView
        order={order}
        statusSlot={
          <OrderStatusSelect orderId={order.id} status={order.status} />
        }
      />
    </div>
  );
}

export { AdminOrderDetail };
