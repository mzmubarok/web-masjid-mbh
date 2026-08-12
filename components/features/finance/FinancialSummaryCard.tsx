import type { ComponentType } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Stack } from "@/components/layout/Stack";
import { Grid } from "@/components/layout/Grid";
import { FinancialStat } from "@/components/features/finance/FinancialStat";
import { cn } from "@/lib/utils";

export type FinancialSummaryCardTone = "primary" | "secondary" | "accent";

const toneClass: Record<FinancialSummaryCardTone, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/20 text-heading",
};

export interface FinancialSummaryFigure {
  label: string;
  /** Pre-formatted value, e.g. "Rp 125.750.000" — no currency logic here. */
  value: string;
}

export interface FinancialSummaryCardProps {
  title: string;
  description?: string;
  /**
   * Renders an icon circle above the title, tinted by `tone` — lets each
   * card read as visually distinct at a glance when several sit side by
   * side (e.g. one card per donation fund), without changing typography,
   * radius, shadow, or spacing.
   */
  icon?: ComponentType<{ className?: string }>;
  /** Tint for the icon circle. @default "primary" */
  tone?: FinancialSummaryCardTone;
  /** Row 1 — the fund's total balance/fund figure, in its own bordered white panel. */
  primaryStat: FinancialSummaryFigure;
  /** Row 2 — two equal-width figures side by side (income, then expense). */
  secondaryStats: [FinancialSummaryFigure, FinancialSummaryFigure];
  /** Row 3 — the fund's current balance, in the accent-highlighted panel. */
  currentBalance: FinancialSummaryFigure;
  className?: string;
}

/**
 * Card shell for one donation fund's financial summary, always in the same
 * three rows: total balance/fund (bordered panel), this month's income and
 * expense side by side, then the current balance (accent highlight) — kept
 * as one fixed layout, rather than a generic stat grid, since every fund
 * card must read identically per the site's financial-transparency design.
 */
export function FinancialSummaryCard({
  title,
  description,
  icon: Icon,
  tone = "primary",
  primaryStat,
  secondaryStats,
  currentBalance,
  className,
}: FinancialSummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        {Icon ? (
          <div className={cn("flex size-11 items-center justify-center rounded-full", toneClass[tone])}>
            <Icon className="size-5" aria-hidden />
          </div>
        ) : null}
        <CardTitle className={Icon ? "pt-2" : undefined}>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-4">
        <Stack gap="md">
          <FinancialStat label={primaryStat.label} value={primaryStat.value} emphasis="total" />
          <Grid cols={2} gap="md">
            <FinancialStat label={secondaryStats[0].label} value={secondaryStats[0].value} />
            <FinancialStat label={secondaryStats[1].label} value={secondaryStats[1].value} />
          </Grid>
          <FinancialStat label={currentBalance.label} value={currentBalance.value} emphasis="balance" />
        </Stack>
      </CardContent>
    </Card>
  );
}
