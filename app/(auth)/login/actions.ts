"use server";

import { redirect } from "next/navigation";

import { isSafeRedirect } from "@/lib/utils";
import { getAuthErrorMessage } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";

export async function signIn(input: LoginInput & { next?: string }) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  redirect(isSafeRedirect(input.next) ? input.next : "/");
}
