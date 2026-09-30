"use client";

import { useState } from "react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatusSelect } from "@/components/features/admin/order-status-select";
import { useAdminOrders } from "@/hooks/admin/use-admin-orders";
import type { AdminOrderStatusFilter } from "@/lib/queries/admin-orders";
import {
  getOrderStatusLabel,
  isOrderStatus,
  ORDER_STATUSES,
} from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function AdminOrdersTable() {
  const [status, setStatus] = useState<AdminOrderStatusFilter>("all");
  const { data: orders, isPending, isError } = useAdminOrders(status);

  function handleFilterChange(value: string | null) {
    if (value === "all" || (value && isOrderStatus(value))) {
      setStatus(value);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Control */}
      <Select value={status} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-full sm:w-48" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {getOrderStatusLabel(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Loading Skeleton */}
      {isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-body-sm text-neutral-400">
          Couldn&apos;t load orders. Please try again.
        </p>
      ) : orders.length === 0 ? (
        <p className="text-body-sm text-neutral-400">
          {status === "all"
            ? "No orders yet."
            : `No ${getOrderStatusLabel(status).toLowerCase()} orders.`}
        </p>
      ) : (
        <>
          {/* Mobile View: Cards Layout (< md breakpoint) */}
          <div className="flex flex-col gap-3 md:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-surface flex flex-col gap-3 rounded-xl border border-neutral-700 p-4"
              >
                {/* Header: Order ID & Date */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-body-sm hover:text-primary text-foreground font-mono font-medium"
                  >
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Link>
                  <span className="text-caption text-neutral-400">
                    {dateFormatter.format(new Date(order.created_at))}
                  </span>
                </div>

                {/* Body: Customer Details */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-body-sm text-foreground font-medium">
                      {order.customer_name || "—"}
                    </div>
                    <div className="text-caption text-neutral-400">
                      {order.customer_phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-body-sm text-foreground font-mono font-semibold">
                      {formatPrice(order.total_price)}
                    </div>
                    <div className="text-caption text-neutral-400">
                      {order.item_count}{" "}
                      {order.item_count === 1 ? "item" : "items"}
                    </div>
                  </div>
                </div>

                {/* Footer: Order Status Action */}
                <div className="border-t border-neutral-800 pt-3">
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Traditional Table (>= md breakpoint) */}
          <div className="bg-surface hidden overflow-x-auto rounded-xl border border-neutral-700 px-6 md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="text-body-sm border-b border-neutral-700 text-neutral-500 uppercase">
                  <th className="px-4 py-3 pl-0 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-800 last:border-b-0"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-body-sm hover:text-primary text-foreground font-mono"
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-body-sm text-foreground">
                        {order.customer_name || "—"}
                      </div>
                      <div className="text-caption text-neutral-400">
                        {order.customer_phone}
                      </div>
                    </td>
                    <td className="text-body-sm py-3 pr-4 whitespace-nowrap text-neutral-400">
                      {dateFormatter.format(new Date(order.created_at))}
                    </td>
                    <td className="text-body-sm py-3 pr-4">
                      {order.item_count}
                    </td>
                    <td className="text-body-sm py-3 pr-4 font-mono">
                      {formatPrice(order.total_price)}
                    </td>
                    <td className="py-3">
                      <OrderStatusSelect
                        orderId={order.id}
                        status={order.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export { AdminOrdersTable };
