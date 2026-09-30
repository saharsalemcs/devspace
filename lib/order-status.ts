import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";
import type { OrderItemDetail } from "@/lib/queries/orders";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function getAllowedNextStatuses(status: string): readonly OrderStatus[] {
  return isOrderStatus(status) ? ORDER_STATUS_TRANSITIONS[status] : [];
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ORDER_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  pending: "order-status-pending",
  processing: "order-status-processing",
  shipped: "order-status-shipped",
  delivered: "order-status-delivered",
};

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getOrderStatusVariant(status: string): BadgeVariant {
  return ORDER_STATUS_VARIANTS[status] ?? "neutral";
}

export interface OrderBundleGroup {
  bundleId: string;
  items: OrderItemDetail[];
}

export interface GroupedOrderItems {
  standalone: OrderItemDetail[];
  bundles: OrderBundleGroup[];
}

export function groupOrderItems(items: OrderItemDetail[]): GroupedOrderItems {
  const standalone = items.filter((item) => item.bundle_id === null);

  const bundleMap = new Map<string, OrderItemDetail[]>();
  for (const item of items) {
    if (item.bundle_id === null) continue;
    const existing = bundleMap.get(item.bundle_id) ?? [];
    bundleMap.set(item.bundle_id, [...existing, item]);
  }

  const bundles: OrderBundleGroup[] = Array.from(bundleMap.entries()).map(
    ([bundleId, items]) => ({ bundleId, items }),
  );

  return { standalone, bundles };
}
