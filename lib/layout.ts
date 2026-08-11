/**
 * Shared class-name lookup tables for the layout primitives in
 * `components/layout/`. Tailwind's compiler needs static, literal class
 * names — it can't see `gap-${n}`, so every scale below is a fixed map
 * rather than an interpolated string. Values stay on the existing 8px
 * spacing scale (design-system/MASTER.md § Spacing); no new tokens.
 */

export type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

/** xs=8px, sm=16px, md=24px, lg=32px, xl=48px. */
export const gapClassMap: Record<Gap, string> = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};

export type GridCols = 1 | 2 | 3 | 4;

/** Mobile-first column progression; matches the project's sm(640)/lg(1024) breakpoints. */
export const gridColsClassMap: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};
