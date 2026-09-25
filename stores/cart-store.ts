// "use client";

import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

export interface CartProductInput {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
}

export interface CartLineItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  /** Groups items added together from the Desk Builder. `null` = standalone item. */
  bundleId: string | null;
}

interface CartState {
  items: CartLineItem[];
  addItem: (product: CartProductInput, quantity?: number) => void;
  removeItem: (productId: string, bundleId?: string | null) => void;
  clearCart: () => void;
  addBundle: (products: CartProductInput[], bundleId: string) => void;
  removeBundle: (bundleId: string) => void;
  updateQuantity: (
    productId: string,
    bundleId: string | null,
    quantity: number,
  ) => void;
}

function isSameLine(
  item: CartLineItem,
  productId: string,
  bundleId: string | null,
) {
  return item.productId === productId && item.bundleId === bundleId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) =>
            isSameLine(item, product.id, null),
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item === existing
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity,
                bundleId: null,
              },
            ],
          };
        }),

      removeItem: (productId, bundleId = null) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !isSameLine(item, productId, bundleId),
          ),
        })),

      clearCart: () => set({ items: [] }),

      addBundle: (products, bundleId) =>
        set((state) => ({
          items: [
            ...state.items,
            ...products.map((product) => ({
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity: 1,
              bundleId,
            })),
          ],
        })),

      removeBundle: (bundleId) =>
        set((state) => ({
          items: state.items.filter((item) => item.bundleId !== bundleId),
        })),

      updateQuantity: (productId, bundleId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) => !isSameLine(item, productId, bundleId),
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              isSameLine(item, productId, bundleId)
                ? { ...item, quantity }
                : item,
            ),
          };
        }),
    }),
    {
      name: "devspace-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useCartItemCount() {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
}

export function useCartSubtotal() {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
}
// interface CartState {

//   /** Replaces the entire cart wholesale — used to hydrate from the DB cart after login-time merge (see § 5.3). */
//   setItems: (items: CartLineItem[]) => void;
// }

// export const useCartStore = create<CartState>()(
//   persist(
//     (set) => ({

//       setItems: (items) => set({ items }),
//     }),
//     {
//       name: "devspace-cart",
//       storage: createJSONStorage(() => localStorage),
//     },
//   ),
// );
