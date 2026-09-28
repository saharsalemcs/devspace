"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/orders/use-orders";
import { getOrderStatusLabel, getOrderStatusVariant } from "@/lib/order-status";
import { formatDate, formatPrice } from "@/lib/utils";

function OrdersList() {
  const { data: orders, isPending, isError } = useOrders();

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-body-sm text-neutral-400">
        Couldn&apos;t load your orders. Please try again.
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-surface flex flex-col items-center gap-2 rounded-xl border border-neutral-700 py-16 text-center">
        <p className="text-h4 text-foreground">No orders yet</p>
        <p className="text-body-sm text-neutral-400">
          Your placed orders will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="bg-surface flex items-center justify-between gap-4 rounded-xl border border-neutral-700 p-4 transition-colors hover:border-neutral-600"
        >
          <div className="flex flex-col gap-1">
            <span className="text-body-sm text-foreground font-medium">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-caption text-neutral-400">
              {formatDate(order.created_at)} · {order.item_count}{" "}
              {order.item_count === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={getOrderStatusVariant(order.status)}>
              {getOrderStatusLabel(order.status)}
            </Badge>
            <span className="text-body text-accent font-mono">
              {formatPrice(order.total_price)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export { OrdersList };
