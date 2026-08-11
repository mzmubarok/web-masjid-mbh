# Design System — Masjid Website

Single source of truth for every UI decision in this project. If a component's styling
disagrees with this document, the component is wrong. Implementation lives in
[`app/globals.css`](../app/globals.css) (CSS tokens), [`lib/motion.ts`](../lib/motion.ts)
(animation presets), and [`lib/design-tokens.ts`](../lib/design-tokens.ts) (JS mirror for
non-CSS consumers).

## Direction

Premium, modern, editorial, elegant, calm, spacious, timeless. Reference points: Apple,
Linear, Airbnb, Notion, Stripe, modern architecture websites — **not** generic mosque-site
aesthetics. No decorative Islamic ornament work; the visual identity comes from
typography, whitespace, hierarchy, architecture, and photography instead.

## Typography

Two fonts only, loaded via `next/font/google` in `app/layout.tsx`:

- **Cormorant Garamond** (`--font-heading`) — Display and H1–H4.
- **Plus Jakarta Sans** (`--font-body`, exposed as the default `font-sans`) — everything else.

| Token | Class | Size | Line-height | Tracking | Weight | Font |
|---|---|---|---|---|---|---|
| Display XL | `text-display-xl` | 72px | 1.05 | −0.02em | 500 | Heading |
| Display | `text-display` | 56px | 1.1 | −0.02em | 500 | Heading |
| H1 | `text-h1` | 44px | 1.15 | −0.015em | 600 | Heading |
| H2 | `text-h2` | 34px | 1.2 | −0.01em | 600 | Heading |
| H3 | `text-h3` | 26px | 1.3 | −0.005em | 600 | Heading |
| H4 | `text-h4` | 21px | 1.35 | 0 | 600 | Heading |
| Body Large | `text-body-lg` | 19px | 1.6 | 0 | 400 | Body |
| Body | `text-body` | 16px | 1.6 | 0 | 400 | Body |
| Small | `text-small` | 14px | 1.5 | 0 | 400 | Body |
| Caption | `text-caption` | 13px | 1.4 | 0.01em | 500 | Body |
| Button | `text-button` | 15px | 1 | 0.01em | 600 | Body |
| Label | `text-label` | 12px | 1.2 | 0.06em | 600 | Body |

`<h1>`–`<h6>` get `font-heading` + `text-heading` automatically (`app/globals.css` base
layer) — apply a `text-*` size class on top for the right scale step. All body-font sizes
already inherit the Plus Jakarta Sans default from `html { font-sans }`; only Display/H1–H4
need an explicit `font-heading` class when used outside a real heading tag.

**Rule:** body copy never drops below `text-small` (14px). Long-form text (announcements,
about copy) should sit inside `max-w-(--content-max-width)` for a readable measure.

## Color

Six brand colors, no more. Every other token is a derived opacity/tint of these six — see
`:root` in `app/globals.css` for the exact `color-mix`/relative-color expressions.

| Brand color | Hex | Role |
|---|---|---|
| Background | `#FAF9F6` | Page background |
| Surface | `#FFFFFF` | Cards, popovers, elevated surfaces |
| Primary | `#0E6B72` | Primary actions, links, focus |
| Secondary | `#14493C` | Secondary actions, deep accents |
| Heading | `#0E2429` | Headings, and the base for all derived text/border/muted tones |
| Accent | `#D5B378` | Gold — sparing use: highlights, dividers, small emphasis details |

### Semantic tokens (Tailwind class → CSS var)

| Class | Token | Derivation |
|---|---|---|
| `bg-background` | `--background` | = Background |
| `bg-surface`, `bg-card`, `bg-popover` | `--surface` / `--card` / `--popover` | = Surface |
| `text-foreground` | `--foreground` | Heading @ 88% opacity |
| `text-heading` | `--heading` | = Heading |
| — (`--text`, JS/CSS var only) | `--text` | Heading @ 78% opacity — softer body-copy tone |
| `bg-muted` | `--muted` | Heading @ 6% opacity — subtle fill |
| `text-muted-foreground` | `--muted-foreground` | Heading @ 55% opacity — secondary text |
| `border-border` | `--border` | Heading @ 12% opacity |
| `border-input` | `--input` | Heading @ 16% opacity |
| `ring-ring` | `--ring` | Primary @ 45% opacity — focus ring |
| `bg-primary` / `text-primary-foreground` | `--primary` / `--primary-foreground` | Primary / Surface |
| `bg-secondary` / `text-secondary-foreground` | `--secondary` / `--secondary-foreground` | Secondary / Surface |
| `bg-accent` / `text-accent-foreground` | `--accent` / `--accent-foreground` | Accent / Heading |
| `bg-success` / `text-success-foreground` | `--success` / `--success-foreground` | Secondary / Surface |
| `bg-warning` / `text-warning-foreground` | `--warning` / `--warning-foreground` | Accent / Heading |
| `bg-destructive` / `text-destructive-foreground` | `--destructive` / `--destructive-foreground` | **Exception**, see below |

**The one deliberate exception:** `success` and `warning` are *reused* brand hues (green,
gold) with new semantic meaning — no new color. `destructive` (`#B2452F`, a muted rust-red)
is the single new color in the system. Error/danger states need a hue users universally
recognize as "wrong" — teal or gold would violate `color-not-only` accessibility guidance
by making errors ambiguous. Keep it desaturated so it stays in the editorial palette rather
than reading as a harsh system red.

**Chart colors** (`--chart-1..5`): Primary, Accent, Secondary, Primary @ 55%, Heading — in
that order, for any future data visualization. No colors outside the brand family.

Dark mode is **not** implemented — nothing in the app applies a `.dark` class yet. The
`.dark` block in `globals.css` is shadcn's untouched neutral default, kept only so it isn't
broken if something references it. Build the real dark palette when a theme toggle is
actually requested, from the same six brand colors.

## Radius

Soft, premium corners — no sharp edges, no pill-everything.

| Token | Class | Value |
|---|---|---|
| xs | `rounded-xs` | 4px |
| sm | `rounded-sm` | 8px |
| md | `rounded-md` | 12px |
| lg | `rounded-lg` | 16px |
| xl | `rounded-xl` | 24px |
| full | `rounded-full` | 9999px |

Default guidance: buttons/inputs → `md`; cards → `lg`; large media/hero panels → `xl`;
avatars/pills/tags → `full`.

## Shadows

Subtle, heading-tinted (not pure black) — avoid Material-style heavy elevation.

| Token | Class | Use |
|---|---|---|
| sm | `shadow-sm` | Hairline separation (inputs, small chips) |
| md | `shadow-md` | Default card elevation |
| lg | `shadow-lg` | Hover/raised state, dropdowns |
| xl | `shadow-xl` | Modals, popovers over photography |

## Spacing

8px base system. Raw scale (`space-2` = 16px, etc.) comes from Tailwind's default spacing
scale — no override needed. Semantic layout tokens live as CSS custom properties in
`app/globals.css` and are desktop-first, stepping down at two breakpoints (tablet ≤1024px,
mobile ≤640px). Consume them with Tailwind's arbitrary-var syntax:
`className="px-(--space-page-x) py-(--space-section-y)"`.

| Token | Desktop | Tablet (≤1024px) | Mobile (≤640px) |
|---|---|---|---|
| `--space-page-x` | 96px | 48px | 24px |
| `--space-section-y` | 128px | 96px | 64px |
| `--space-grid-gap` | 24px | 24px | 16px |
| `--space-card-padding` | 32px | 32px | 24px |
| `--space-button-padding-x` | 24px | 24px | 24px |
| `--space-button-padding-y` | 12px | 12px | 12px |

## Layout

- **Container max width:** `--container-max-width` = 1280px (`max-w-(--container-max-width)`).
- **Content (readable) max width:** `--content-max-width` = 720px, for prose/long-form text.
- **Section vertical rhythm:** use `--space-section-y` between major page sections.
- **Grid gap:** `--space-grid-gap` for card grids / multi-column layouts.
- **Card padding:** `--space-card-padding` inside any card/surface container.
- Desktop-first: author base styles for desktop, then narrow down via the tablet/mobile
  breakpoints above (matches `CLAUDE.md` → Responsive Design).

## Motion

Presets live in [`lib/motion.ts`](../lib/motion.ts). Shared easing curve:
`EASE_PREMIUM = cubic-bezier(0.16, 1, 0.3, 1)` — a soft decelerate, used everywhere for
consistency.

| Preset | Export | Motion | Duration |
|---|---|---|---|
| Fade Up | `fadeUp` | opacity + 28px → 0 | 700ms |
| Fade Down | `fadeDown` | opacity + −28px → 0 | 700ms |
| Fade Left | `fadeLeft` | opacity + 28px x → 0 | 700ms |
| Fade Right | `fadeRight` | opacity + −28px x → 0 | 700ms |
| Scale In | `scaleIn` | opacity + 0.96 → 1 scale | 700ms |
| Hover Button | `hoverButton` | scale 1.02 / tap 0.98 | 200ms |
| Hover Card | `hoverCard` | lift −4px y | 250ms |
| Hover Image | `hoverImage` | scale 1.04 | 600ms |

Use `staggerChildren(gap?)` to stagger a list/grid's entrance (default 80ms per item).
Entrance presets are meant for `whileInView`, not `animate` on mount, so content isn't
hidden if JS is slow. Movement stays small (28px) — no excessive travel. Components apply
`useReducedMotion()` themselves; these presets don't decide that.

## Icons

Lucide React only (already installed). One stroke width, one style (outline) throughout —
no mixing with filled icons or emoji.

## UI Principles

- Whitespace is a feature, not empty space — let sections breathe.
- Typography and hierarchy carry the design; decoration is minimal.
- One primary action per section/screen; everything else is visually subordinate.
- Photography and architectural imagery are the visual identity — not ornamental patterns.
- Every color pairing must hit WCAG AA contrast (4.5:1 body text, 3:1 large text/UI).

## Anti-patterns (avoid)

- Hardcoded hex/px values in components — always go through a token.
- Any color outside the brand six (plus the one destructive exception).
- Heavy drop shadows, gradients, or skeuomorphic effects.
- Decorative crescents/arches/geometric Islamic patterns as UI chrome.
- Motion longer than ~700ms or larger than ~30px of travel for entrance animations.
- New Google Fonts beyond Cormorant Garamond and Plus Jakarta Sans.
