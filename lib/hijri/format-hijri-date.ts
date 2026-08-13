const HIJRI_MONTH_NAMES = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Syaban",
  "Ramadan",
  "Syawal",
  "Zulkaidah",
  "Zulhijah",
] as const;

/**
 * Formats a Hijri day/month/year as "12 Ramadan 1447 H" — the same style
 * Hero's own hardcoded hijriDate fallback already uses. Falls back to the
 * numeric "day/month/year H" format (matching the admin Hijri Overrides
 * list's own display) when month is outside 1-12, rather than throwing.
 */
export function formatHijriDate(day: number, month: number, year: number): string {
  const monthName = HIJRI_MONTH_NAMES[month - 1];
  if (!monthName) {
    return `${day}/${month}/${year} H`;
  }
  return `${day} ${monthName} ${year} H`;
}
