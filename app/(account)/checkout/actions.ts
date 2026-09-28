"use server";

import { createClient } from "@/lib/supabase/server";
import { checkoutSchema, type CheckoutInput } from "@/lib/schemas/checkout";
import { placeOrderRpc, clearDbCartAfterOrder } from "@/lib/queries/orders";
import type { CartLineItem } from "@/stores/cart-store";

type PlaceOrderResult =
  | { ok: false; error: string; field?: "customer_phone" }
  | { ok: true; orderId: string };

export async function placeOrder(
  input: CheckoutInput,
  items: CartLineItem[],
): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }

  if (items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please log in to place an order." };
  }

  let orderId: string;
  try {
    orderId = await placeOrderRpc(supabase, parsed.data, items);
  } catch (error) {
    console.error("place_order failed:", error);

    const message = error instanceof Error ? error.message : "";
    const hint =
      error && typeof error === "object" && "hint" in error
        ? (error as { hint?: string }).hint
        : undefined;

    if (message.includes("Phone number required")) {
      return {
        ok: false,
        error:
          hint ??
          "Please add a phone number to your profile before placing an order.",
        field: "customer_phone",
      };
    }

    return {
      ok: false,
      error:
        hint ?? "Something went wrong placing your order. Please try again.",
    };
  }

  try {
    await clearDbCartAfterOrder(supabase, user.id);
  } catch (error) {
    console.error("Failed to clear DB cart after order:", error);
  }

  return { ok: true, orderId };
}
