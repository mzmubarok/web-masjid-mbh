import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type FinancialStatEmphasis = "total" | "balance";

// "total" — the card's Total Balance/Fund row: a white, bordered panel with
// a modestly heavier value weight, enough to read as the primary summary
// without competing with "balance" for attention.
// "balance" — the card's Current Balance row: the existing accent-tinted
// highlight, still the strongest visual weight on the card.
// Same box proportions and value typography for both — only the tint
// changes, so "Saldo Saat Ini" reads as equally important as "Total Saldo",
// not smaller/larger or differently scaled.
const emphasisClass: Record<FinancialStatEmphasis, string> = {
  total: "items-center rounded-xl border border-border bg-surface p-4 text-center",
  balance: "items-center rounded-xl border border-primary/20 bg-primary/5 p-4 text-center",
};

const emphasisLabelClass: Record<FinancialStatEmphasis, string> = {
  total: "text-muted-foreground",
  balance: "text-primary",
};

const emphasisValueClass: Record<FinancialStatEmphasis, string> = {
  total: "text-h3 font-bold text-heading",
  balance: "text-h3 font-bold text-primary",
};

export interface FinancialStatProps {
  label: string;
  /** Pre-formatted value, e.g. "Rp 12.500.000" — no currency logic here. */
  value: string;
  trend?: "up" | "down";
  /** e.g. "+8% from last month" — required when `trend` is set, so the change is never color-only. */
  trendLabel?: string;
  /** Sets this figure apart with a bordered/tinted panel — see the two variants above. Omit for a plain figure. */
  emphasis?: FinancialStatEmphasis;
  className?: string;
}

/** A single labeled figure, optionally with a trend indicator (icon + text, never color alone). */
export function FinancialStat({ label, value, trend, trendLabel, emphasis, className }: FinancialStatProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <div
      className={cn("flex flex-col gap-1", emphasis && emphasisClass[emphasis], className)}
    >
      <span className={cn("text-label", emphasis ? emphasisLabelClass[emphasis] : "text-muted-foreground")}>
        {label}
      </span>
      <span className={cn("font-heading tabular-nums", emphasis ? emphasisValueClass[emphasis] : "text-h3 text-heading")}>
        {value}
      </span>
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
