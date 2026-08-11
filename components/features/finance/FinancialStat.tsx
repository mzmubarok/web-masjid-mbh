import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FinancialStatProps {
  label: string;
  /** Pre-formatted value, e.g. "Rp 12.500.000" — no currency logic here. */
  value: string;
  trend?: "up" | "down";
  /** e.g. "+8% from last month" — required when `trend` is set, so the change is never color-only. */
  trendLabel?: string;
  className?: string;
}

/** A single labeled figure, optionally with a trend indicator (icon + text, never color alone). */
export function FinancialStat({ label, value, trend, trendLabel, className }: FinancialStatProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-label text-muted-foreground">{label}</span>
      <span className="text-h3 font-heading tabular-nums text-heading">{value}</span>
      {trend && trendLabel ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-caption",
            trend === "up" ? "text-success" : "text-destructive"
          )}
        >
          {TrendIcon ? <TrendIcon className="size-3.5" aria-hidden /> : null}
          {trendLabel}
        </span>
      ) : null}
    </div>
  );
}
