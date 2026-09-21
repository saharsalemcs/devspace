"use server";

import { getAuthErrorMessage } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  return { success: true };
}
