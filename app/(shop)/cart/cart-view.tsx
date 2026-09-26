"use client";

import { toast } from "sonner";

import { calculateCartTotals, groupCartItems } from "@/lib/cart";
import {
  deleteCartBundle,
  deleteCartItem,
  updateCartItemQuantity,
} from "@/lib/queries/cart";
import { createClient } from "@/lib/supabase/client";
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

  function handleRemoveItem(productId: string, bundleId: string | null) {
    removeItem(productId, bundleId);

    if (isLoggedIn) {
      deleteCartItem(createClient(), productId, bundleId).catch(() => {
        toast.error("Couldn't sync cart. Please refresh the page.");
      });
    }
  }

  function handleQuantityChange(
    productId: string,
    bundleId: string | null,
    quantity: number,
  ) {
    updateQuantity(productId, bundleId, quantity);

    if (isLoggedIn) {
      updateCartItemQuantity(
        createClient(),
        productId,
        bundleId,
        quantity,
      ).catch(() => {
        toast.error("Couldn't sync cart. Please refresh the page.");
      });
    }
  }

  function handleRemoveBundle(bundleId: string) {
    removeBundle(bundleId);

    if (isLoggedIn) {
      deleteCartBundle(createClient(), bundleId).catch(() => {
        toast.error("Couldn't sync cart. Please refresh the page.");
      });
    }
  }

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
                  handleQuantityChange(item.productId, null, quantity)
                }
                onRemove={() => handleRemoveItem(item.productId, null)}
              />
            ))}
          </div>
        )}

        {bundles.map((bundle) => (
          <CartBundleGroup
            key={bundle.bundleId}
            bundle={bundle}
            onQuantityChange={(productId, quantity) =>
              handleQuantityChange(productId, bundle.bundleId, quantity)
            }
            onRemoveItem={(productId) =>
              handleRemoveItem(productId, bundle.bundleId)
            }
            onRemoveBundle={() => handleRemoveBundle(bundle.bundleId)}
          />
        ))}
      </div>

      <CartSummary totals={totals} isLoggedIn={isLoggedIn} />
    </div>
  );
}

export { CartView };
