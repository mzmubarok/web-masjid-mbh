/**
 * Small local slug normalizer — lowercase, ASCII, hyphen-separated. No slug
 * utility exists in the project's dependencies and this doesn't warrant
 * adding one. Shared by every feature that needs a unique slug (Event
 * Categories, Events, ...) so they can't drift apart.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents (e.g. e-with-acute -> e)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
