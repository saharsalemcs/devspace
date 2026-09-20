import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// DevSpace mark: a curved ultrawide screen lit in Ember Orange, sitting on a
// desk. The screen carries the brand accent; the stand and desk use
// `currentColor` so the mark adapts to whatever surface it sits on.
function LogoMark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      data-slot="logo-mark"
      className={cn("size-7 shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient
          id="ds-screen"
          x1="4"
          y1="7"
          x2="28"
          y2="18.6"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF7D45" />
          <stop offset="1" stopColor="#E64509" />
        </linearGradient>
        <radialGradient id="ds-glow">
          <stop stopColor="#FF5A1F" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FF5A1F" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="16" cy="20.5" rx="13" ry="5.5" fill="url(#ds-glow)" />
      <path d="M14.5 16.8h3v5.6h-3z" fill="currentColor" />
      <rect
        x="2.5"
        y="22.4"
        width="27"
        height="2.6"
        rx="1.3"
        fill="currentColor"
      />
      <path d="M4 8.6Q16 7 28 8.6V18.6Q16 17 4 18.6Z" fill="url(#ds-screen)" />
      <path
        d="M6 9.9Q16 8.4 26 9.9V11.2Q16 9.7 6 11.2Z"
        fill="#FFFFFF"
        fillOpacity="0.22"
      />
    </svg>
  );
}

// Full lockup: mark + wordmark. Keeps the established "Dev" + ember "Space"
// treatment the navbar already used.
function Logo({
  className,
  markClassName,
  ...props
}: ComponentProps<"span"> & { markClassName?: string }) {
  return (
    <span
      data-slot="logo"
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <LogoMark className={markClassName} />
      <span className="text-h4 text-foreground font-bold tracking-tight">
        Dev<span className="text-accent">Space</span>
      </span>
    </span>
  );
}

export { Logo, LogoMark };
