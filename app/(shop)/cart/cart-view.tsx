"use client";

import { calculateCartTotals, groupCartItems } from "@/lib/cart";
import { useCartStore } from "@/stores/cart-store";
import { CartBundleGroup } from "./cart-bundle-group";
import { CartEmptyState } from "./cart-empty-state";
import { CartItemRow } from "./cart-item-row";
import { CartSummary } from "./cart-summary";

function CartView({ isLoggedIn }: { isLoggedIn: boolean }) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeBundle = useCartStore((state) => state.removeBundle);

  if (items.length === 0) {
    return <CartEmptyState />;
  }

  const { standalone, bundles } = groupCartItems(items);
  const totals = calculateCartTotals(items);

  return (
    <div
      data-slot="cart-view"
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px]"
    >
      <div className="flex flex-col gap-6">
        {standalone.length > 0 && (
          <div className="bg-surface flex flex-col rounded-xl border border-neutral-700 p-4">
            {standalone.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onQuantityChange={(quantity) =>
                  updateQuantity(item.productId, null, quantity)
                }
                onRemove={() => removeItem(item.productId, null)}
              />
            ))}
          </div>
        )}

        {bundles.map((bundle) => (
          <CartBundleGroup
            key={bundle.bundleId}
            bundle={bundle}
            onQuantityChange={(productId, quantity) =>
              updateQuantity(productId, bundle.bundleId, quantity)
            }
            onRemoveItem={(productId) => removeItem(productId, bundle.bundleId)}
            onRemoveBundle={() => removeBundle(bundle.bundleId)}
          />
        ))}
      </div>

      <CartSummary totals={totals} isLoggedIn={isLoggedIn} />
    </div>
  );
}

export { CartView };
