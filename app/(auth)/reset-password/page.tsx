import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthCard } from "../auth-card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return (
      <AuthCard>
        <CardHeader>
          <CardTitle className="text-h3 font-semibold">Link expired</CardTitle>
          <CardDescription className="text-body">
            This password reset link is invalid or has expired. Request a new
            one from the forgot password page.
          </CardDescription>
        </CardHeader>
      </AuthCard>
    );
  }

  return <ResetPasswordForm />;
}
