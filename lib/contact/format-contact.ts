/**
 * Normalizes a free-typed phone number into a wa.me link — strips
 * everything but digits and swaps a leading "0" for the "62" country code,
 * matching how `ContactLocation.whatsapp` is entered in the admin form
 * (a plain `tel` input with no fixed format).
 */
export function toWhatsAppHref(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${withCountryCode}`;
}

/**
 * Formats ContactLocation's opening-hours fields into one sentence, e.g.
 * "Setiap hari, 04.00 – 21.00 WIB" — matching Location.tsx's existing
 * hardcoded convention exactly (period-separated time, en dash between
 * times, WIB suffix; same colon-to-period idiom `formatEventTime` already
 * uses for a single time). `operatingNotes` prefixes the sentence when
 * present; omitted entirely when blank, leaving just the time range.
 */
export function formatOperatingHours(openingTime: string, closingTime: string, operatingNotes: string | null): string {
  const range = `${openingTime.replace(":", ".")} – ${closingTime.replace(":", ".")} WIB`;
  return operatingNotes ? `${operatingNotes}, ${range}` : range;
}
