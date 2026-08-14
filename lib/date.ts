const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a `YYYY-MM-DD` (HTML `<input type="date">`) value as UTC midnight — the calendar date, nothing more. */
export function parseDateOnly(value: string): Date | null {
  if (!DATE_PATTERN.test(value)) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** The inverse of `parseDateOnly` — reads the UTC calendar date back out so it round-trips into `<input type="date">`. */
export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * "Sabtu, 15 Agustus 2026" — Indonesian, always in Asia/Jakarta regardless
 * of the server/browser's own timezone. Shared by Hero's client-side "now"
 * fallback and the homepage's server-side render, so both ever produce this
 * format in exactly one place.
 */
export function formatGregorianDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}
