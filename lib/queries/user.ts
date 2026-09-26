import { Database, Tables } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CurrentUser = {
  id: string;
  email: string | undefined;
  fullName: string | null;
  role: Tables<"profiles">["role"];
};

export function currentUserQueryKey() {
  return ["current-user"] as const;
}

export async function fetchCurrentUser(
  supabase: SupabaseClient<Database>,
): Promise<CurrentUser | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userData.user.id)
    .single();

  if (profileError) throw profileError;

  return {
    id: userData.user.id,
    email: userData.user.email,
    fullName: profile.full_name,
    role: profile.role,
  };
}
