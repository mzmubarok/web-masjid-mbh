import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Grid } from "@/components/layout/Grid";

export interface FinancialSummaryCardProps {
  title: string;
  description?: string;
  /** One or more `<FinancialStat>` elements. */
  children: ReactNode;
  className?: string;
}

/** Card shell for a group of FinancialStat figures — e.g. this month's income/expense/balance. */
export function FinancialSummaryCard({ title, description, children, className }: FinancialSummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-4">
        <Grid cols={3} gap="md">
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
}
