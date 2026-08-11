@AGENTS.md

# Engineering Guidelines — Masjid Website

This file is the permanent engineering guideline for this project. It applies to every
feature built from this point forward. When in doubt, prefer the option that keeps the
codebase clean, scalable, readable, maintainable, reusable, fast, accessible, and visually
consistent — in that order of tie-breaking.

## Project Goal

A premium modern mosque website. Every technical and visual decision must serve:

- Clean Architecture
- Scalability
- Readability
- Maintainability
- Reusable Components
- High Performance
- Accessibility
- Consistent UI

## General Principles

- Think before coding. Plan the structure before writing a single file.
- Never rush an implementation to "just get it working."
- Keep everything clean and modular.
- Every decision should optimize for long-term maintainability over short-term speed.

## Clean Code

- Write self-explanatory code; a reader shouldn't need a comment to know what a block does.
- Keep functions short and single-purpose.
- Keep files organized — one clear responsibility per file.
- Avoid deeply nested logic; prefer early returns and guard clauses.
- Avoid duplicated code; extract and reuse instead.
- Remove unused code immediately (dead components, unused props, commented-out blocks).
- Prefer readability over cleverness. Boring code that's obvious beats clever code that isn't.

## SOLID Principles

Apply where it genuinely helps, not by default everywhere. Especially:

- **Single Responsibility** — a component, hook, or util does one thing.
- **Dependency Inversion** — UI depends on abstractions (props, interfaces), not concrete
  data-fetching or service internals.
- **Interface Segregation** — don't force a component to accept props it doesn't use.

## DRY Principle

Never duplicate logic. Extract reusable code (components, hooks, utils, types) as soon as
a second use case appears — not preemptively for a hypothetical one.

## KISS Principle

Keep solutions simple. Avoid unnecessary abstractions, avoid overengineering. No interface
for a single implementation, no config for a value that never changes, no factory for one
product. The simplest solution that satisfies the requirement is the correct one.

## File Organization

Scalable, purpose-based folder structure. Keep related files together; never mix unrelated
concerns in the same folder.

```
app/                  # routes only (App Router)
components/
  ui/                 # shadcn/ui primitives
  layout/             # header, footer, nav, page shell
  sections/           # page sections (Hero, PrayerTimes, Programs, Donation...)
  cards/              # card-style presentational units
  common/             # small shared building blocks (icons wrappers, badges, etc.)
lib/                  # framework-adjacent singletons/config (e.g. prisma client, cn())
hooks/                # reusable client-side hooks
utils/                # pure helper functions, no React
types/                # shared TypeScript types/interfaces
services/             # data-fetching / business-logic layer (add when the first data
                       # source lands — queries, mutations, external API calls; keeps
                       # components free of fetch/query logic)
prisma/               # schema, migrations
public/
  images/
  icons/
  logo/
```

Components never reach into `prisma/` or raw data-access code directly — that goes through
`services/` (or a server action) so the data layer can change without touching the UI.

## File Size Rules

Guidelines, not hard limits — but treat them as a signal to split:

| File type   | Recommended max |
|-------------|------------------|
| Pages       | 100 lines        |
| Components  | 200 lines        |
| Hooks       | 150 lines        |
| Utilities   | 150 lines        |

If a file grows past this, split it into smaller modules (extract a sub-component, a hook,
or a helper) rather than letting it grow.

## Component Rules

- One component = one responsibility.
- One component per file.
- Always reuse existing components before creating a new one — check `components/ui`,
  `components/common`, and `components/cards` first.
- Never duplicate UI that already exists elsewhere.
- Prefer composition (children, slots, render props) over copy-pasting a similar component.

## Naming Convention

Descriptive, PascalCase for components:

```
Navbar.tsx
HeroSection.tsx
PrayerTimeSection.tsx
ProgramCard.tsx
DonationCard.tsx
```

Avoid non-descriptive names: `Component.tsx`, `NewComponent.tsx`, `Temp.tsx`,
`FinalComponent.tsx`.

## TypeScript

- `strict` mode is on (`tsconfig.json`) — keep it on.
- Avoid `any`. If a type is genuinely unknown, use `unknown` and narrow it.
- Create reusable types in `types/` instead of inlining the same shape repeatedly.
- Prefer `interface` for public object shapes (component props, API payloads); use `type`
  for unions, intersections, and utility compositions.

## Styling

- Never hardcode colors or spacing values directly in components.
- Always use the design tokens defined in `app/globals.css` (`--background`, `--foreground`,
  `--primary`, `--card`, `--border`, `--radius`, etc., mapped through shadcn's `@theme`
  block) and the two configured font variables — `--font-heading` (Cormorant Garamond) and
  `--font-body` (Plus Jakarta Sans, applied by default via `font-sans`).
- Use Tailwind CSS utility classes consistently; don't mix in ad-hoc inline `style={}`
  unless the value is truly dynamic and can't be a class (e.g. a computed transform).
- New recurring colors/spacing go into the token layer first, then get consumed —
  never as raw hex/px sprinkled through components.

## Responsive Design

Desktop first, then adapt down: Desktop → Tablet → Mobile. Every page and section must be
verified to work correctly at each breakpoint before it's considered done.

## Performance

- Use Server Components by default (Next.js App Router default).
- Only opt into Client Components (`"use client"`) when the component needs interactivity,
  browser APIs, hooks like `useState`/`useEffect`, or `framer-motion` animation.
- Lazy-load heavy or below-the-fold components (`next/dynamic`) when appropriate.
- Optimize images with `next/image`; never use a raw `<img>` for content images.
- Avoid unnecessary re-renders — keep client component boundaries small and push them as
  far down the tree as possible.

## Accessibility

- Use semantic HTML (`nav`, `header`, `main`, `section`, `footer`, proper heading order).
- Provide meaningful `alt` text for every content image; decorative images use `alt=""`.
- Every interactive element must be reachable and operable via keyboard.
- Maintain sufficient color contrast for all text/background token pairs, in both the
  light and any future dark variant.

## Code Consistency

- Follow the existing project structure; don't introduce a parallel pattern for something
  that already has one.
- Keep imports organized (external → internal → relative) and remove unused imports.
- Use consistent formatting (match ESLint/Prettier output already configured in the repo).

## UI Philosophy

The UI should feel: **Premium, Modern, Minimal, Editorial, Calm, Spacious, Elegant.**

- Generous whitespace over dense layouts.
- Avoid visual clutter — every element on screen should earn its place.
- Avoid generic mosque-website tropes (default green/gold gradients, stock crescent clip
  art, cramped info-dump layouts).
- Let typography (Cormorant Garamond for headings, Plus Jakarta Sans for body), spacing,
  hierarchy, photography, and subtle motion (framer-motion, used sparingly) carry the
  design — not decoration.

## Development Workflow

1. Think before writing code; plan the structure.
2. Build reusable foundations first (tokens, primitives, shared types) before sections.
3. Build page sections by composing reusable components, not one-off markup.
4. Never create large monolithic files — split as you go, not after the fact.
5. Always optimize for maintainability over speed of first delivery.
