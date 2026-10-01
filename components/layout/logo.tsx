import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function LogoMark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-slot="logo-mark"
      className={cn("size-7 shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id="ds-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7D45" />
          <stop offset="100%" stopColor="#FF5A1F" />
        </linearGradient>
        <linearGradient id="ds-stand-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A4A52" />
          <stop offset="100%" stopColor="#26262B" />
        </linearGradient>
        <radialGradient id="ds-ambient-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient desk glow */}
      <ellipse cx="16" cy="23" rx="12" ry="4" fill="url(#ds-ambient-glow)" />

      {/* Desk surface */}
      <rect x="4" y="24" width="24" height="2" rx="1" fill="#26262B" />

      {/* Stand stem */}
      <path d="M14.5 17h3v6h-3z" fill="url(#ds-stand-grad)" />

      {/* Stand base plate */}
      <rect x="11" y="22.5" width="10" height="2" rx="1" fill="#34343A" />

      {/* Monitor chassis frame */}
      <rect
        x="3"
        y="6"
        width="26"
        height="13.5"
        rx="2.5"
        fill="#151518"
        stroke="#26262B"
        strokeWidth="1"
      />

      {/* Ember display screen */}
      <rect
        x="4.5"
        y="7.5"
        width="23"
        height="10.5"
        rx="1.5"
        fill="url(#ds-accent-grad)"
      />

      {/* Top glass reflection highlight */}
      <path
        d="M5.5 8.7h21"
        stroke="#FFFFFF"
        strokeWidth="0.8"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />

      {/* Developer prompt symbol: > _ */}
      <path
        d="M8.5 10.8L11.5 12.8L8.5 14.8"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="13.5"
        y1="14.8"
        x2="17.5"
        y2="14.8"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Logo({
  className,
  markClassName,
  ...props
}: ComponentProps<"span"> & { markClassName?: string }) {
  return (
    <span
      data-slot="logo"
      className={cn("inline-flex items-center gap-2.5", className)}
      {...props}
    >
      <LogoMark className={markClassName} />
      <span className="text-h4 text-foreground font-bold tracking-tight select-none">
        Dev<span className="text-accent">Space</span>
      </span>
    </span>
  );
}

export { Logo, LogoMark };
