import type { LucideIcon } from "lucide-react";
import { AlertCircleIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  digest?: string;
  className?: string;
  contained?: boolean;
}

export function ErrorState({
  icon: Icon = AlertCircleIcon,
  eyebrow,
  title,
  description,
  actions,
  digest,
  className,
  contained = true,
}: ErrorStateProps) {
  const content = (
    <div
      data-slot="error-state"
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4 sm:py-24",
        className,
      )}
    >
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900/80 shadow-inner">
        <Icon className="size-8 text-accent" aria-hidden="true" />
      </div>

      {eyebrow && (
        <span className="mb-2 text-caption font-mono uppercase tracking-widest text-accent">
          {eyebrow}
        </span>
      )}

      <h1 className="text-h2 font-bold tracking-tight text-foreground max-w-md">
        {title}
      </h1>

      {description && (
        <p className="mt-3 max-w-md text-body-sm text-neutral-400 leading-relaxed">
          {description}
        </p>
      )}

      {digest && (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-caption font-mono text-neutral-500">
          <span>Error ID:</span>
          <span className="text-neutral-400 select-all">{digest}</span>
        </div>
      )}

      {actions && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );

  if (contained) {
    return <Container>{content}</Container>;
  }

  return content;
}
