import type { Transition, Variants } from "framer-motion";

/**
 * Motion system — reusable framer-motion presets for the design system.
 * Entrance presets (fade/scale) are meant for scroll-reveal use with
 * `whileInView`; hover presets are meant for `whileHover`/`whileTap`.
 *
 * Keep durations here in sync with design-system/MASTER.md § Motion System.
 * Components are responsible for respecting `prefers-reduced-motion`
 * (e.g. via framer-motion's `useReducedMotion` hook) — this file only
 * defines the presets, not when/whether to apply them.
 */

/** Soft, premium ease-out used for every entrance animation. */
export const EASE_PREMIUM: Transition["ease"] = [0.16, 1, 0.3, 1];

const ENTRANCE_DISTANCE = 28; // px — deliberately small, no excessive movement
const ENTRANCE_TRANSITION: Transition = {
  duration: 0.7,
  ease: EASE_PREMIUM,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: ENTRANCE_DISTANCE },
  visible: { opacity: 1, y: 0, transition: ENTRANCE_TRANSITION },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -ENTRANCE_DISTANCE },
  visible: { opacity: 1, y: 0, transition: ENTRANCE_TRANSITION },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: ENTRANCE_DISTANCE },
  visible: { opacity: 1, x: 0, transition: ENTRANCE_TRANSITION },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -ENTRANCE_DISTANCE },
  visible: { opacity: 1, x: 0, transition: ENTRANCE_TRANSITION },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: ENTRANCE_TRANSITION },
};

/** Stagger a parent's children entrance by this gap; pair with any fade/scale variant above. */
export const staggerChildren = (gap = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap } },
});

/** whileHover/whileTap props for a primary button — subtle scale, no layout shift. */
export const hoverButton = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2, ease: EASE_PREMIUM },
};

/** whileHover props for a card — gentle lift, shadow change handled in CSS via hover:shadow-lg. */
export const hoverCard = {
  whileHover: { y: -4 },
  transition: { duration: 0.25, ease: EASE_PREMIUM },
};

/** whileHover props for an image — slow, subtle zoom (pair with overflow-hidden wrapper). */
export const hoverImage = {
  whileHover: { scale: 1.04 },
  transition: { duration: 0.6, ease: EASE_PREMIUM },
};
