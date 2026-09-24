import * as React from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

type IconButtonSize = "icon-xs" | "icon-sm" | "icon" | "icon-lg";

interface IconButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "size"
> {
  size?: IconButtonSize;
  "aria-label": string;
}

function IconButton({
  className,
  variant = "ghost",
  size = "icon-lg",
  ...props
}: IconButtonProps) {
  return (
    <Button
      data-slot="icon-button"
      variant={variant}
      size={size}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

export { IconButton };
