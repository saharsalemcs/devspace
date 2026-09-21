"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import { signUp } from "./actions";
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

export function RegisterForm() {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  function onSubmit(values: RegisterInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await signUp(values);
      if (result?.error) {
        setFormError(result.error);
      }
    });
  }

  return (
    <AuthCard>
      <CardHeader>
        <CardTitle className="text-h3 font-semibold">
          Create an account
        </CardTitle>
        <CardDescription className="text-sm">
          Join DevSpace to start building.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <FormField
            label="Full name"
            htmlFor="full_name"
            error={errors.full_name}
          >
            <Input
              id="full_name"
              autoComplete="name"
              aria-invalid={!!errors.full_name || undefined}
              {...register("full_name")}
            />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email || undefined}
              {...register("email")}
            />
          </FormField>

          <FormField
            label="Password"
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
            Create account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-body-sm justify-center gap-1.5">
        <span className="text-neutral-400">Already have an account?</span>
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </AuthCard>
  );
}
