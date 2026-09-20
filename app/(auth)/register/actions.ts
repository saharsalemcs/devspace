"use server";

import { redirect } from "next/navigation";

import { getAuthErrorMessage } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";

export async function signUp(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Check the highlighted fields and try again." };
  }

  const { email, password, full_name } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  redirect("/");
}
