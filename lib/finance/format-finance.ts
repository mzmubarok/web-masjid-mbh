import type { Prisma } from "@/lib/generated/prisma/client";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

// Stored as UTC midnight elsewhere in this app (see lib/date.ts) — format in
// UTC here too, so the displayed month never shifts with server timezone.
const periodFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Formats a FinancialReport Decimal figure as "Rp 45.200.000" — matching the
 * section's existing hardcoded convention. Prisma's `Decimal` isn't
 * serializable across the Server→Client boundary, so this must run before
 * the value ever reaches a Client Component.
 */
export function formatFinancialAmount(amount: Prisma.Decimal): string {
  return currencyFormatter.format(amount.toNumber());
}

/** Formats a report's `reportMonth`/`reportYear` as "Maret 2026" — matching the section's existing hardcoded "1 Maret 2026" convention (day omitted, none is stored). */
export function formatReportPeriod(reportMonth: number, reportYear: number): string {
  return periodFormatter.format(new Date(Date.UTC(reportYear, reportMonth - 1, 1)));
}
