import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function AuthCard({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "[--card-spacing:--spacing(8)]",
        "**:data-[slot=card-title]:text-h3",
        "**:data-[slot=card-description]:text-body",
        "**:data-[slot=button]:h-10",
        "**:data-[slot=button]:px-4",
        "**:data-[slot=button]:text-base",
        className,
      )}
      {...props}
    />
  );
}
