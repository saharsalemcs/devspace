"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfile } from "@/lib/queries/profile";
import { currentUserQueryKey } from "@/hooks/use-current-user";
import { createClient } from "@/lib/supabase/client";
import type { ProfileInput } from "@/lib/schemas/profile";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProfileInput) => {
      const supabase = createClient();

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("You must be logged in to update your profile.");
      }

      return updateProfile(supabase, userData.user.id, input);
    },
    onSuccess: () => {
      // full_name shown in useCurrentUser() (e.g. the Navbar UserMenu
      // label) needs to reflect the change immediately.
      queryClient.invalidateQueries({ queryKey: currentUserQueryKey() });
    },
  });
}
