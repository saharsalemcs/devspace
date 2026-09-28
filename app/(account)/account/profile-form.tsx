"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { profileSchema, type ProfileInput } from "@/lib/schemas/profile";
import { useUpdateProfile } from "@/hooks/use-update-profile";

interface ProfileFormProps {
  email: string;
  initialFullName: string;
  initialPhone: string;
}

function ProfileForm({
  email,
  initialFullName,
  initialPhone,
}: ProfileFormProps) {
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initialFullName,
      phone: initialPhone,
    },
  });

  function onSubmit(values: ProfileInput) {
    updateProfile.mutate(values, {
      onSuccess: () => {
        toast.success("Profile updated.");
      },
      onError: () => {
        toast.error("Couldn't update your profile. Please try again.");
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <FormField label="Email" htmlFor="email">
        <Input id="email" value={email} disabled readOnly />
      </FormField>

      <FormField label="Full Name" htmlFor="full_name" error={errors.full_name}>
        <Input
          id="full_name"
          aria-invalid={!!errors.full_name || undefined}
          {...register("full_name")}
        />
      </FormField>

      <FormField label="Phone Number" htmlFor="phone" error={errors.phone}>
        <Input
          id="phone"
          type="tel"
          aria-invalid={!!errors.phone || undefined}
          {...register("phone")}
        />
      </FormField>

      <Button
        type="submit"
        loading={updateProfile.isPending}
        disabled={!isDirty}
        className="w-fit"
      >
        Save Changes
      </Button>
    </form>
  );
}

export { ProfileForm };
