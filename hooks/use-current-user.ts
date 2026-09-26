"use client";

import { useQuery } from "@tanstack/react-query";

import { currentUserQueryKey, fetchCurrentUser } from "@/lib/queries/user";
import { createClient } from "@/lib/supabase/client";

export type { CurrentUser } from "@/lib/queries/user";
export { currentUserQueryKey };

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey(),
    queryFn: () => fetchCurrentUser(createClient()),
  });
}
