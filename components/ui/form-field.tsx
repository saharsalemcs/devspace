import * as React from "react";
import type { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";

interface FormFieldProps extends React.ComponentProps<"div"> {
  label: string;
  htmlFor: string;
  error?: FieldError | string;
  hint?: string;
}

function FormField({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
  ...props
}: FormFieldProps) {
  const message = typeof error === "string" ? error : error?.message;

  return (
    <div
      data-slot="form-field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {message ? (
        <p role="alert" className="text-body-sm text-destructive">
          {message}
        </p>
      ) : hint ? (
        <p className="text-body-sm text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}

export { FormField };
