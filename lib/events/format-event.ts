// Stored as UTC midnight (see lib/date.ts) — format in UTC so the displayed
// calendar date always matches what was picked, regardless of server timezone.
const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" });

/** Formats an Event's startDate as "14 Maret 2026" — matching the section's existing hardcoded convention. */
export function formatEventDate(startDate: Date): string {
  return dateFormatter.format(startDate);
}

/** Formats an Event's "HH:MM" startTime as "19.30 WIB" — matching the section's existing hardcoded convention (period separator, WIB suffix). */
export function formatEventTime(startTime: string): string {
  return `${startTime.replace(":", ".")} WIB`;
}
