"use server";

import { isSafeRedirect } from "@/lib/utils";
import { getAuthErrorMessage } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { fetchDbCart, mergeCartItems } from "@/lib/queries/cart";
import type { CartLineItem } from "@/stores/cart-store";

type SignInResult =
  | { ok: false; error: string }
  | { ok: true; cartItems: CartLineItem[] | null; redirectTo: string };

export async function signIn(
  input: LoginInput & { next?: string },
  localCart: CartLineItem[] = [],
): Promise<SignInResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, error: getAuthErrorMessage(error.message) };
  }

  let cartItems: CartLineItem[] | null = null;
  try {
    if (localCart.length > 0) {
      await mergeCartItems(supabase, localCart);
    }
    cartItems = await fetchDbCart(supabase);
  } catch (err) {
    console.error("Login-time cart merge failed:", err);
  }

  return {
    ok: true,
    cartItems,
    redirectTo: isSafeRedirect(input.next) ? input.next : "/",
  };
}
