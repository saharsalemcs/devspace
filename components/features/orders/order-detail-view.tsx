import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  getOrderStatusLabel,
  getOrderStatusVariant,
  groupOrderItems,
} from "@/lib/order-status";
import { formatDate, formatPrice } from "@/lib/utils";
import type { OrderDetail, OrderItemDetail } from "@/lib/queries/orders";

interface OrderDetailViewProps {
  order: OrderDetail;
  statusSlot?: ReactNode;
}

function OrderDetailView({ order, statusSlot }: OrderDetailViewProps) {
  const { standalone, bundles } = groupOrderItems(order.items);
  const orderNumber = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-h2 text-foreground font-bold">
            Order #{orderNumber}
          </h1>
          {statusSlot ?? (
            <Badge variant={getOrderStatusVariant(order.status)}>
              {getOrderStatusLabel(order.status)}
            </Badge>
          )}
        </div>
        <p className="text-body-sm text-neutral-400">
          Placed {formatDate(order.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {standalone.length > 0 && (
            <div className="bg-surface flex flex-col divide-y divide-neutral-800 rounded-xl border border-neutral-700 p-4">
              {standalone.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>
          )}

          {bundles.map((bundle) => (
            <div
              key={bundle.bundleId}
              className="bg-surface flex flex-col gap-2 rounded-xl border border-neutral-700 p-4"
            >
              <Badge variant="bundle" className="w-fit">
                Desk Build
              </Badge>
              <div className="flex flex-col divide-y divide-neutral-800">
                {bundle.items.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-surface flex flex-col gap-2 rounded-xl border border-neutral-700 p-6">
            <h2 className="text-h4 text-foreground font-semibold">Summary</h2>
            <div className="text-body-sm flex justify-between text-neutral-300">
              <span>Subtotal</span>
              <span className="font-mono">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_total > 0 && (
              <div className="text-body-sm text-accent flex justify-between">
                <span>Discount</span>
                <span className="font-mono">
                  -{formatPrice(order.discount_total)}
                </span>
              </div>
            )}
            <div className="text-body text-foreground flex justify-between border-t border-neutral-800 pt-2 font-semibold">
              <span>Total</span>
              <span className="text-accent font-mono">
                {formatPrice(order.total_price)}
              </span>
            </div>
          </div>

          <div className="bg-surface flex flex-col gap-2 rounded-xl border border-neutral-700 p-6">
            <h2 className="text-h4 text-foreground font-semibold">
              Shipping Address
            </h2>
            <p className="text-body-sm text-neutral-300">
              {order.customer_name}
              <br />
              {order.customer_phone}
              <br />
              {order.shipping_address.street}, {order.shipping_address.city}
              <br />
              {order.shipping_address.governorate}
              {order.shipping_address.postal_code
                ? ` · ${order.shipping_address.postal_code}`
                : ""}
            </p>
            {order.shipping_address.notes && (
              <p className="text-body-sm text-neutral-400">
                Note: {order.shipping_address.notes}
              </p>
            )}
          </div>

          <div className="bg-surface flex flex-col gap-2 rounded-xl border border-neutral-700 p-6">
            <h2 className="text-h4 text-foreground font-semibold">Payment</h2>
            <p className="text-body-sm text-neutral-300">
              {order.payment_method === "cod"
                ? "Cash on Delivery"
                : order.payment_method}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderItemRow({ item }: { item: OrderItemDetail }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-col">
        <span className="text-body-sm text-foreground">
          {item.product_name}
        </span>
        <span className="text-caption text-neutral-400">
          Qty {item.quantity} · {formatPrice(item.unit_price)} each
        </span>
      </div>
      <span className="text-body-sm text-foreground font-mono">
        {formatPrice(item.unit_price * item.quantity)}
      </span>
    </div>
  );
}

export { OrderDetailView };
