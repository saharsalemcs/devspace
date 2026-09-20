import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// The shared `Card` is tuned for dense contexts (dashboard/admin) at 16px
// `--card-spacing`. An auth card is the whole page, so it gets roomier
// padding. Type and button sizes stay on the elements themselves — setting
// them from here would out-specify any per-card override.
export function AuthCard({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn("[--card-spacing:--spacing(8)]", className)}
      {...props}
    />
  );
}
