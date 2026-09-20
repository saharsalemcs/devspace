"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/schemas/auth";
import { updatePassword } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AuthCard } from "../auth-card";

export function ResetPasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await updatePassword(values);
      if (result?.error) {
        setFormError(result.error);
        return;
      }
      toast.success("Password updated.");
      router.push("/");
    });
  }

  return (
    <AuthCard>
      <CardHeader>
        <CardTitle className="text-h3 font-semibold">
          Set a new password
        </CardTitle>
        <CardDescription className="text-body">
          Choose a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <FormField
            label="New password"
            htmlFor="password"
            error={errors.password}
            hint={
              errors.password
                ? undefined
                : "At least 6 characters, with upper, lower, and a number."
            }
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password || undefined}
              {...register("password")}
            />
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="confirm"
            error={errors.confirm}
          >
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm || undefined}
              {...register("confirm")}
            />
          </FormField>

          {formError ? (
            <p role="alert" className="text-body-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            loading={pending}
            className="h-10 w-full text-base"
          >
            Update password
          </Button>
        </form>
      </CardContent>
    </AuthCard>
  );
}
