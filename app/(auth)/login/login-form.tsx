"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { isSafeRedirect } from "@/lib/utils";
import { signIn } from "./actions";
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

export function LoginForm() {
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const next = isSafeRedirect(rawNext) ? rawNext : undefined;

  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(values: LoginInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await signIn({ ...values, next });
      if (result?.error) {
        setFormError(result.error);
      }
    });
  }

  return (
    <AuthCard>
      <CardHeader>
        <CardTitle className="text-h3 font-semibold">Sign in</CardTitle>
        <CardDescription className="text-body">
          Welcome back to DevSpace.
        </CardDescription>
      </CardHeader>
      <CardContent>
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

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password}
          >
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password || undefined}
              {...register("password")}
            />
          </FormField>

          {formError ? (
            <p role="alert" className="text-body-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-body-sm hover:text-foreground text-neutral-400"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={pending}
            className="h-10 w-full text-base"
          >
            Sign in
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-body-sm justify-center gap-1.5">
        <span className="text-neutral-400">Don&apos;t have an account?</span>
        <Link href="/register" className="text-accent hover:underline">
          Create one
        </Link>
      </CardFooter>
    </AuthCard>
  );
}
