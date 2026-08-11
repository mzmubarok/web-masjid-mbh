/**
 * TypeScript mirror of the brand tokens defined in `app/globals.css`.
 * CSS custom properties are the source of truth for styling components —
 * reach for those (Tailwind classes / `var(--token)`) first. Use this file
 * only where a literal value is required outside CSS: chart color arrays,
 * `<meta name="theme-color">`, canvas/PDF/OG-image generation, etc.
 *
 * Keep in sync with the `:root` block in app/globals.css and with
 * design-system/MASTER.md.
 */

export const brandColors = {
  background: "#FAF9F6",
  surface: "#FFFFFF",
  primary: "#0E6B72",
  secondary: "#14493C",
  heading: "#0E2429",
  accent: "#D5B378",
  /** Deliberate exception to the brand-only palette — see MASTER.md. */
  destructive: "#B2452F",
} as const;

/** Chart series order, reusing brand hues only (no invented colors). */
export const chartColors = [
  brandColors.primary,
  brandColors.accent,
  brandColors.secondary,
  brandColors.heading,
] as const;

export const radius = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  full: "9999px",
} as const;

/** Matches the max-width media queries in app/globals.css. */
export const breakpoints = {
  mobile: 640,
  tablet: 1024,
} as const;

export const layout = {
  containerMaxWidth: "80rem", // 1280px
  contentMaxWidth: "45rem", // 720px — readable long-form measure
} as const;

/** Transition durations — pair with `transition-duration` / inline `style`. */
export const transitions = {
  fast: "150ms",
  normal: "250ms",
  slow: "400ms",
} as const;

/**
 * Stacking order for fixed/overlay UI. Gaps are left between each layer so a
 * new one can be inserted later without renumbering existing layers.
 */
export const zIndex = {
  base: 0,
  navbar: 40,
  dropdown: 50,
  overlay: 60,
  modal: 70,
  toast: 80,
} as const;

/** Backdrop/filter blur amounts — e.g. a modal scrim behind `bg-heading/50`. */
export const blur = {
  sm: "4px",
  md: "8px",
  lg: "16px",
} as const;

/**
 * Easing curves as CSS `cubic-bezier()` strings. `smooth` mirrors
 * `EASE_PREMIUM` in `lib/motion.ts` — keep the two in sync; `standard` is a
 * general-purpose curve for small state changes (color/opacity) that don't
 * go through framer-motion.
 */
export const easing = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;
