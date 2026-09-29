import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

function KpiCard({ label, value, icon: Icon }: KpiCardProps) {
  return (
    <div
      data-slot="kpi-card"
      className="bg-surface flex items-center gap-4 rounded-xl border border-neutral-700 p-5"
    >
      <div className="bg-accent/10 text-accent flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-caption text-neutral-400 uppercase">{label}</span>
        <span className="text-h3 text-foreground font-bold">{value}</span>
      </div>
    </div>
  );
}

export { KpiCard };
