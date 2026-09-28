import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { ProfileInput } from "@/lib/schemas/profile";

export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: ProfileInput,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: input.full_name, phone: input.phone })
    .eq("id", userId);

  if (error) throw error;
}
