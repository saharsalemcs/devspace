"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/schemas/auth";
import { requestPasswordReset } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AuthCard } from "../auth-card";

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await requestPasswordReset(values);
      if (!result?.error) setSent(true);
    });
  }

  return (
    <AuthCard>
      <CardHeader>
        <CardTitle className="text-h3 font-semibold">Forgot password</CardTitle>
        <CardDescription className="text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p role="status" className="text-body-sm text-foreground">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            noValidate
          >
            <FormField label="Email" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email || undefined}
                {...register("email")}
              />
            </FormField>

            <Button
              type="submit"
              loading={pending}
              className="h-10 w-full text-base"
            >
              Send reset link
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="text-body-sm justify-center">
        <Link href="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </CardFooter>
    </AuthCard>
  );
}
