import type { CartLineItem } from "@/stores/cart-store";

export const BUNDLE_DISCOUNT_THRESHOLD = 3;
export const BUNDLE_DISCOUNT_RATE = 0.05;

export interface CartBundleGroup {
  bundleId: string;
  items: CartLineItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export interface GroupedCart {
  standalone: CartLineItem[];
  bundles: CartBundleGroup[];
}

function lineTotal(item: CartLineItem) {
  return item.price * item.quantity;
}

export function groupCartItems(items: CartLineItem[]): GroupedCart {
  const standalone: CartLineItem[] = [];
  const bundleOrder: string[] = [];
  const bundleItems = new Map<string, CartLineItem[]>();

  for (const item of items) {
    if (item.bundleId === null) {
      standalone.push(item);
      continue;
    }

    if (!bundleItems.has(item.bundleId)) {
      bundleItems.set(item.bundleId, []);
      bundleOrder.push(item.bundleId);
    }
    bundleItems.get(item.bundleId)!.push(item);
  }

  const bundles: CartBundleGroup[] = bundleOrder.map((bundleId) => {
    const groupItems = bundleItems.get(bundleId)!;
    const subtotal = groupItems.reduce((sum, item) => sum + lineTotal(item), 0);
    const discount =
      groupItems.length >= BUNDLE_DISCOUNT_THRESHOLD
        ? subtotal * BUNDLE_DISCOUNT_RATE
        : 0;

    return {
      bundleId,
      items: groupItems,
      subtotal,
      discount,
      total: subtotal - discount,
    };
  });

  return { standalone, bundles };
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  total: number;
}

export function calculateCartTotals(items: CartLineItem[]): CartTotals {
  const { standalone, bundles } = groupCartItems(items);

  const standaloneSubtotal = standalone.reduce(
    (sum, item) => sum + lineTotal(item),
    0,
  );
  const bundleSubtotal = bundles.reduce(
    (sum, bundle) => sum + bundle.subtotal,
    0,
  );
  const discount = bundles.reduce((sum, bundle) => sum + bundle.discount, 0);
  const subtotal = standaloneSubtotal + bundleSubtotal;

  return { subtotal, discount, total: subtotal - discount };
}
