import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-h2 text-foreground mb-8 font-bold">Your Account</h1>
      <ProfileForm
        email={user.email ?? ""}
        initialFullName={profile?.full_name ?? ""}
        initialPhone={profile?.phone ?? ""}
      />
    </div>
  );
}
