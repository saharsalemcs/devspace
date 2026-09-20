"use server";

import { getAuthErrorMessage } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/schemas/auth";

export async function updatePassword(input: ResetPasswordInput) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Check the highlighted fields and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  return { success: true };
}
