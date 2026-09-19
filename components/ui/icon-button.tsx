import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

type IconButtonSize = "icon-xs" | "icon-sm" | "icon" | "icon-lg"

interface IconButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "size"> {
  size?: IconButtonSize
  /** Icon buttons carry no visible label — an accessible name is required. */
  "aria-label": string
}

function IconButton({
  className,
  variant = "ghost",
  size = "icon",
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
  )
}

export { IconButton }
