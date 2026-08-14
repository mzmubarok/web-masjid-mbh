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
