# Homepage Blueprint — Masjid Baitul Hikmah Gondolayu Lor

Page-specific companion to [`design-system/MASTER.md`](../MASTER.md) — read that first for tokens
(color, type, radius, shadow, spacing, motion). This document is the section-by-section plan for
the homepage only. It is a planning artifact: **no code, no JSX** — that's the next step, after
this is reviewed.

Tagline: **"Mengaji • Mengabdi • Menghidupi"** (Learning • Serving • Sustaining Life) — this rhythm
of three words is a useful motif: several sections below echo a three-beat structure (three pillars,
three stats, three CTAs) to keep it present without repeating it as decoration.

Component references below point to what's already built in `components/ui`, `components/common`,
`components/layout`, and `components/features` — this blueprint assumes those primitives, it
doesn't invent new ones.

---

## 0. The Whole-Page Rhythm (read this first)

A calm, premium scroll isn't uniform — it's **paced**. Thirteen sections in a row, all on the same
white background, all with the same spacing, reads as monotonous no matter how nice each one is in
isolation. The rhythm here comes from three things working together:

### 3.1 — A three-beat background pattern

Instead of alternating light/white every single section (busy, checkerboard-y), the page uses
**three dark/tinted "anchor" moments** against a mostly light field. Anchors are where the page
asks for a beat of visual attention; everything else is quiet canvas for content and photography.

| # | Section | Background | Role |
|---|---------|------------|------|
| 1 | Announcement Bar | `primary` (thin) | Utility strip, barely a "beat" — sets the brand color at the very top |
| 2 | Navbar | `surface`, transparent→solid on scroll | Structural, not a beat |
| 3 | Hero | Full-bleed photography + scrim | **Beat 1** — the welcome |
| 4 | Prayer Times + Hijri | `primary` (deep teal band) | **Beat 2** — the utility anchor, the section most visitors actually came for |
| 5 | About Mosque | `background` | Quiet |
| 6 | Upcoming Events | `surface` | Quiet (cards need a neutral canvas) |
| 7 | Financial Transparency | `muted` | Quiet, but visually distinct from its neighbors (data needs its own "room") |
| 8 | Donation | `secondary` or accent-tinted photography | **Beat 3** — the conversion moment, directly after trust is established |
| 9 | Gallery | `background`, edge-to-edge imagery | Quiet, photography does the work |
| 10 | Social Media | `surface` | Quiet, compact |
| 11 | Location | `background` | Quiet |
| 12 | Contact | `surface` | Quiet |
| 13 | Footer | `heading` (near-black teal) | Closing beat — grounds the page, classic premium-site footer treatment |

Three real beats (Hero, Prayer Times, Donation) plus a grounded close (Footer) is enough to give the
scroll a heartbeat without turning it into a slideshow. Every other section stays quiet so the
beats keep their power.

### 3.2 — Vertical rhythm via `Section` spacing tokens

All section spacing comes from `components/layout/Section`'s `spacing` variant
(`--space-section-y`, responsive). Default `md` everywhere; reserve `lg` for the three beats
(Hero, Prayer Times, Donation) so they get literal breathing room proportional to their visual
weight, and `sm` only for the Announcement Bar. Never hand-roll one-off padding — a page where
every section uses the same four spacing values, consistently, is what reads as "considered" rather
than "assembled."

### 3.3 — Motion as punctuation, not decoration

Use `lib/motion.ts` presets throughout (`fadeUp` for entrances, `staggerChildren` for grids,
`hoverCard`/`hoverImage`/`hoverButton` for interaction). The rule for the whole page: **content
fades up into place once, on first scroll into view — it never re-animates on repeat scroll past**,
and nothing animates automatically/on a loop except the two things that are genuinely live data
(PrayerCountdown's digits changing, and the Announcement Bar's optional message rotation, if there's
more than one active announcement). Everything else is a single, calm `fadeUp` — one movement per
element, then stillness. Stillness is what makes a premium site feel premium; motion is the
exception, not the ambience.

### 3.4 — One primary action per beat

Hero → "Lihat Jadwal Sholat" (orient). Prayer Times → implicit, no CTA (it *is* the destination).
Donation → "Donasi Sekarang" (convert). Three beats, three distinct jobs, no competing CTAs shouting
over each other in the same viewport at any scroll position.

---

## 1. Announcement Bar

**Purpose:** Surface a single time-sensitive notice (Friday prayer time change, Ramadan schedule,
renovation notice, event reminder) above the navbar, without competing with primary navigation.

**Content hierarchy:** icon (optional, e.g. a small info/megaphone mark) → message text (one line,
truncates rather than wraps) → optional inline link ("Selengkapnya") → dismiss control (always
last, always reachable).

**Desktop layout:** Full-width thin strip, `bg-primary text-primary-foreground`, `Container` inside
with content horizontally centered, `~40–44px` height. Message centered; dismiss `IconButton`
(ghost variant, sized down but still ≥44×44 hit area via padding) pinned to the far right.

**Mobile layout:** Same strip, message may truncate with `text-overflow: ellipsis` — do not wrap to
two lines (keeps the bar from pushing the navbar down unpredictably). Dismiss control keeps its
full 44×44 tap target even though the bar itself is visually thinner than that.

**CTA:** Optional single inline text link, e.g. "Selengkapnya →" — never a filled button (this bar
is a whisper, not a pitch).

**User interaction:** Click the link to jump to the relevant section/page. Click the dismiss (×) to
hide for the session (`sessionStorage`, not permanent — a new visit should be able to see current
notices again; that's an implementation note for later, not a design decision to hide).

**Hover behavior:** Link underlines on hover; dismiss icon shifts to a subtly filled circle
background (`hover:bg-primary-foreground/10`) — no scale, no color hue change, just an opacity/fill
shift consistent with `IconButton`'s ghost states.

**Animation:** On dismiss, the bar collapses height + fades (`opacity` and `height` via
`AnimatePresence` exit, ~200ms, `EASE_PREMIUM`) rather than snapping away — content below should
shift up smoothly, not jump.

**Accessibility:** `role="region"` `aria-label="Announcement"`; dismiss button has `aria-label="Dismiss announcement"`; if the message is a link, it's real link markup, not a div with an onClick.

**Responsive behavior:** Always present at the very top, never sticky on its own (only the navbar
becomes sticky) — it should be allowed to scroll away, that's part of why it doesn't compete for
attention after the first screen.

**Recommended spacing:** `py-2 px-(--space-page-x)`, gap-3 between icon/message/link/dismiss.

**Suggested imagery:** None — text and one small icon only.

---

## 2. Navbar

**Purpose:** Persistent wayfinding and brand presence; the one UI element visible at every scroll
position.

**Content hierarchy:** Logo (left) → primary nav links (center or left-adjacent) → primary CTA
button "Donasi" (right) → mobile: logo + hamburger only.

**Desktop layout:** `Container` (default size), single row, `h-20`. Logo uses the `Logo` component
(`size="md"`, wordmark, official mark image as the `mark` slot). Nav links: Beranda, Tentang, Jadwal
Sholat, Kegiatan, Donasi, Galeri, Kontak — six to seven items max, in `text-small font-medium`, gap
`space-6`. "Donasi" as a `Button` (`variant="primary"`, `size="sm"`) at the far right, visually
distinct from the plain-text nav links (it's the one link that's also a commercial action).

**Mobile layout:** Logo left, single `IconButton` (Menu icon) right. Tapping opens a full-height
slide-in panel from the right (not a dropdown — full panel, matches "escape-routes" and gives room
for the Donasi CTA to stay prominent). Panel: nav links stacked (`Stack gap="lg"`, large tap
targets), Donasi button full-width at the bottom, close (X) top-right.

**CTA:** "Donasi" — the *only* button-styled item in the navbar. Every other item is a plain text
link. This is the one place on the page the donation ask is present on every screen, which is
exactly why it must stay visually quiet (small, not competing with Beat 3) — persistent but not
pushy.

**User interaction:** Anchor-links scroll smoothly (global `scroll-behavior: smooth`, already set in
`app/globals.css`) to in-page sections for a single-page homepage; if content later moves to real
routes, these become normal `<Link>`s — the visual/interaction spec doesn't change either way.

**Hover behavior:** Nav links get an underline that grows from center (`transform: scaleX` on a
pseudo-element, 150ms) rather than an instant underline — subtle, on-brand motion. Donasi button
uses the standard `hoverButton` preset (scale 1.02).

**Animation:** On scroll past ~80px, navbar transitions from `bg-transparent` (when placed over the
Hero's photography) to `bg-surface/90 backdrop-blur-md shadow-sm` — a 200ms color/opacity
transition, not a layout jump. This is the one place `blur` is used *for its documented purpose*
(indicating the navbar is now "floating" above scrolling content, not decoration).

**Accessibility:** `<nav aria-label="Primary">`; current section (when scroll-spy is added later)
gets `aria-current="page"` or `aria-current="true"`; mobile panel traps focus while open and returns
focus to the hamburger button on close; Escape closes the panel.

**Responsive behavior:** Sticky (`position: sticky; top: 0`) at `zIndex.navbar` (already defined in
`lib/design-tokens.ts`) on every breakpoint. On mobile, the panel uses `min-h-dvh` (not `100vh`) so
it isn't cut off by mobile browser chrome.

**Recommended spacing:** `px-(--space-page-x)` (same token as everything else — the navbar's
horizontal edges must align exactly with `Container` below it), `h-20` desktop / `h-16` mobile.

**Suggested imagery:** Logo mark only (official asset, from `public/logo/`) — no photography.

---

## 3. Hero

**Purpose:** The welcome. Establish who the mosque is, the emotional tone (calm, dignified,
community-rooted), and give the visitor one clear first action.

**Content hierarchy:** Small eyebrow/kicker ("Selamat Datang" or the tagline itself, small caps
label) → mosque name as the dominant headline (`text-display-xl`, `font-heading`) → tagline
"Mengaji • Mengabdi • Menghidupi" as a supporting line (can literally be the eyebrow *or* a
secondary line under the headline — not both, pick one placement) → one-sentence description →
primary CTA + secondary CTA → scroll-cue.

**Desktop layout:** Full-bleed real mosque photography (exterior architecture, golden-hour or
well-lit interior) as the background, `min-h-dvh` or `~90vh`, with a dark gradient scrim
(`bg-gradient-to-t from-heading/70 via-heading/20 to-transparent`) anchored to the bottom so text
sitting in the lower two-thirds stays legible without flattening the whole photo. Text block
left-aligned or centered — for an editorial/architectural feel, **left-aligned, vertically anchored
to the lower third** reads more premium than dead-centered (dead-center is the "generic template"
look this brief explicitly wants to avoid). Content sits inside `Container size="content"` so line
length stays controlled even at very wide viewports.

**Mobile layout:** Same photo + scrim treatment, but crop/position the image so the architectural
focal point (dome, minaret, main entrance) survives a portrait crop — this needs an actual
`object-position` decision per photo, not just `object-cover` on autopilot. Text stays left-aligned,
full width minus page padding, CTAs stack full-width instead of sitting side by side.

**CTA:** Primary — "Lihat Jadwal Sholat" (`Button variant="primary" size="lg"`), scrolls to the
Prayer Times anchor section. Secondary — "Tentang Kami" (`Button variant="outline" size="lg"`, using
a light/inverted outline treatment since it sits on photography — border in `surface`/white at
reduced opacity, text `surface`). Exactly two CTAs, one visual weight class apart — never two
primary-styled buttons side by side.

**User interaction:** Primary CTA scroll-jumps to Prayer Times; secondary scroll-jumps to About.
Scroll-cue (a small down-chevron or "Scroll" label near the bottom center) is also clickable,
scrolls one viewport down.

**Hover behavior:** Both buttons use the standard `hoverButton` preset. The scroll-cue, if animated
at rest (see below), pauses its loop on hover as a small point of care (interruptible animation
principle) — or simpler: don't animate it at all and just give it a hover opacity shift, which is
the safer, calmer choice given "no excessive movement."

**Animation:** On load: headline and CTAs `fadeUp` in with a ~40–60ms stagger (kicker → headline →
description → CTAs), total under ~1s so it never feels like it's making the visitor wait. The
background photo does **not** parallax or Ken-Burns zoom — with a subject this dignified, a moving
background reads as gimmicky, not premium; keep the photo still and let the scrim/typography do the
work. Scroll-cue may have a very slow (~2s), very small (4–6px) vertical drift — respecting
`prefers-reduced-motion`, and off entirely for anyone with that preference set.

**Accessibility:** `<h1>` is the mosque name (the *only* `<h1>` on the page — every other section
heading is `<h2>`). Photo is a CSS background or an `<Image>` with `alt=""` (decorative, since the
headline already conveys the same information) `aria-hidden` on the image node. Contrast of the
text over the scrim must hit 4.5:1 — verify against the darkest and lightest regions of the actual
photo chosen, not just the average.

**Responsive behavior:** `min-h-dvh` (not `100vh`) so mobile browser chrome doesn't clip content or
cause a jump on load. Reduce heading size at the `text-display`/`text-h1` step on mobile rather than
letting `text-display-xl` (72px) wrap awkwardly on a 375px screen — this is a deliberate downstep,
not the same class at every size.

**Recommended spacing:** `Section spacing="lg"`; text block padding-bottom generous
(`~space-12`–`space-16`) above the scroll-cue so the composition doesn't feel cramped against the
viewport edge.

**Suggested imagery:** The single strongest real photograph of the mosque's exterior architecture —
this is the one image on the whole site allowed to be a "hero shot": symmetrical facade, minaret
silhouette against sky, or a warmly lit interior with visible congregation (with appropriate
consent/privacy consideration for identifiable faces). No stock photography, no illustration.

---

## 4. Prayer Times + Hijri Calendar

**Purpose:** The single most-used utility on the page — many visitors arrive specifically to check
prayer times. This is Beat 2 and deserves to look like the site's "instrument panel": precise, calm,
legible at a glance.

**Content hierarchy:** Hijri date + Gregorian date (top, centered, quiet) → next-prayer countdown
(the dominant element — largest type on the page after the Hero headline) → row of all five daily
prayer times, with the next one visually distinguished.

**Desktop layout:** Full-width `primary` band. Inside `Container`: `HijriDate` centered at top
(`gregorianDate` shown as the smaller secondary line it already supports). Below it, `PrayerCountdown`
centered, large (`text-display`, tabular numerals — already built to use `tabular-nums`). Below
that, a horizontal row of five `PrayerCard`s in a `Grid cols={5}`-equivalent (five across, evenly
spaced) — actually use a plain flex row here rather than the `Grid` primitive, since `Grid`'s column
scale tops out at 4 and this is exactly 5 items; a `flex justify-between` row with equal-width
children is the correct, honest choice rather than forcing the 4-column primitive to do something
it wasn't built for. The current/next prayer's `PrayerCard` uses `isNext` (already a supported
prop) — it gets pulled into a `surface`-colored, elevated card against the dark band, the one card
that "pops forward" out of the band.

**Mobile layout:** `HijriDate` and `PrayerCountdown` stay centered and stacked, same as desktop just
narrower. The five `PrayerCard`s switch to a **horizontal snap-scroll row**
(`overflow-x-auto snap-x snap-mandatory`, each card `snap-center`) rather than wrapping into a 3+2
grid — five items wrapping in a grid always leaves an orphaned, off-center pair in the second row,
which reads as unfinished. A horizontal scroll row keeps every card the same size and lets the
"next prayer" `isNext` card be scrolled into center view as the natural starting position.

**CTA:** None needed — this section *is* the destination, adding a CTA here would be asking the
visitor to leave the thing they came for. (If a "Lihat Jadwal Bulanan" / full monthly schedule page
exists later, a quiet text link below the row is appropriate — not a button.)

**User interaction:** Purely informational/glanceable; no required interaction beyond scrolling the
mobile row. The countdown ticks live (owned by a page-level hook feeding `PrayerCountdown`'s `value`
prop — the component itself stays presentational, per the component library's design).

**Hover behavior (desktop only):** Non-next `PrayerCard`s get a subtle `hoverCard` lift on hover
(consistent with Card's `interactive` variant) even though they're not clickable — it communicates
"this is live data, not a static image" without requiring a click destination. If there truly is no
interactive destination, consider omitting hover entirely rather than implying clickability that
leads nowhere — pick one and be consistent site-wide.

**Animation:** The whole band `fadeUp`s in once on scroll-into-view. The countdown's digits update
in place (no per-digit slide/flip animation — a flip-clock effect is charming but is exactly the
kind of "excessive movement" the brief asks to avoid; a plain number swap is calmer and still reads
as "live"). The `isNext` card transitions its own highlighted state with a smooth
background/border color transition (200ms) at the moment the "next" prayer changes — never an
instant snap between cards.

**Accessibility:** This section's heading is visually optional (the countdown *is* the heading) but
still needs a real, visually-hidden `<h2>` ("Jadwal Sholat") for screen-reader/document structure.
The whole live region (countdown + next-prayer label) should use `aria-live="polite"` so screen
reader users get an occasional, non-intrusive update rather than silence or a flood of announcements
every second — update the live region text on prayer-change, not on every tick.

**Responsive behavior:** Countdown digit size steps down from `text-display` to `text-h1` on
mobile so five to eight characters ("02:15:33") never risk wrapping.

**Recommended spacing:** `Section spacing="lg"` (this is a beat, give it room); `space-8`–`space-10`
between the Hijri date block and the countdown; `space-6` between the countdown and the prayer row.

**Suggested imagery:** None inside the band itself — this section is typography and color, not
photography. (Optionally, a very subtle, low-opacity geometric texture from the mosque's actual
architecture — e.g. a cropped photo of a real ceiling/mihrab detail at ~8% opacity as a background
texture — but only if it doesn't reduce number legibility; when in doubt, leave it flat `primary`.)

---

## 5. About Mosque

**Purpose:** Establish institutional credibility and warmth — who built/runs the mosque, its history
and role in Gondolayu Lor, and its guiding values (a natural place to visually echo the
"Mengaji • Mengabdi • Menghidupi" three-part tagline as three short value statements).

**Content hierarchy:** `SectionHeader` (eyebrow "Tentang Kami", title, one-paragraph description) →
two-column split: real photography on one side, narrative copy on the other → below that, a
three-item value/pillar row (Mengaji / Mengabdi / Menghidupi), each with a one-line description.

**Desktop layout:** `Container`, `SectionHeader align="left"` at top. Below: two-column
`grid grid-cols-2 gap-(--space-grid-gap)` — photo left (or right, alternate with the Events section's
image-side later so the page doesn't always favor one side), narrative text right, vertically
centered against the photo's height. Photo uses `aspect-[4/5]` (portrait-ish, more editorial than a
wide landscape crop) with `rounded-lg`. Below the two-column block, the three-pillar row:
`Grid cols={3}`, each pillar a simple icon-or-numeral + short label + one sentence, no card chrome
(no border/shadow) — these should read as typography, not as UI components, reinforcing "minimal,
no excessive ornament."

**Mobile layout:** Single column — photo first (full width, `aspect-video` this time, wide crops
read better full-bleed on mobile than tall ones), narrative text below it, three pillars stacked
(`Stack gap="lg"`) rather than a 3-col grid.

**CTA:** Optional single quiet text link, "Selengkapnya tentang sejarah kami →", only if there's a
dedicated About/history page to send visitors to. If not, no CTA — this section can simply end.

**User interaction:** Static/read; no required interaction.

**Hover behavior:** If the photo is ever wrapped as a link to a full About page, use `hoverImage`
(subtle 1.04 scale within an `overflow-hidden` wrapper). If it's not a link, no hover state — don't
add hover affordance to something that isn't interactive.

**Animation:** Photo `fadeLeft`/`fadeRight` (matching whichever side it's on) as it scrolls into
view, text column `fadeUp`, three pillars `staggerChildren` (~80ms apart) as they enter.

**Accessibility:** `<h2>` for the section title. Photo `alt` describes the actual scene (e.g. "Main
prayer hall of Masjid Baitul Hikmah viewed from the entrance"), not "mosque photo". The three
pillars are a `<dl>` (term/definition) or a simple heading+paragraph pattern — not a bare `<div>`
soup — so the label/description relationship is programmatically clear.

**Responsive behavior:** The two-column grid collapses to one column at the `md` breakpoint (not
`lg`) since text-next-to-portrait-photo gets cramped earlier than a typical two-column layout would.

**Recommended spacing:** `Section spacing="md"`; `space-8` gap between photo and text columns;
`space-12` between the two-column block and the three-pillar row.

**Suggested imagery:** A real, editorial-quality photo of the mosque's interior or a community
moment (not empty architecture again — Hero already covered the building; About is the place for
*people and life*, if usable photography exists — otherwise a second strong architectural angle,
different from the Hero shot).

---

## 6. Upcoming Events

**Purpose:** Show the mosque is active — kajian (study sessions), Friday khutbah themes, holiday
programs, community events — and drive attendance.

**Content hierarchy:** `SectionHeader` ("Kegiatan Mendatang" / Upcoming Events) → grid of `EventCard`s
(image, `EventBadge` status, title, date/location) → "Lihat Semua Kegiatan" CTA.

**Desktop layout:** `SectionHeader align="left"` with the "view all" CTA placed inline to the right
of the header (a common, space-efficient editorial pattern — header and section-level CTA share one
row) rather than repeating it below the grid too. Below: `Grid cols={3}` of `EventCard`s, three
upcoming events shown (not the whole calendar — a homepage teases, a dedicated Events page lists
everything).

**Mobile layout:** Single column stack (`Grid cols={1}` or a horizontal snap-scroll row if there are
often 4+ upcoming events and horizontal browsing suits a "what's next" teaser better than a long
vertical stack pushing Financial Transparency far down the page). Recommend snap-scroll here for the
same reason as Prayer Times: keeps the section's on-screen height predictable regardless of event
count.

**CTA:** Section-level — "Lihat Semua Kegiatan →" (`Button variant="outline"` or a plain text link
with an arrow, next to the header). Card-level — none; the whole `EventCard` is the clickable
target (tapping anywhere on the card opens the event's detail), not a separate "Read more" link
competing inside the card.

**User interaction:** Click/tap anywhere on an `EventCard` → event detail (future page/modal, out of
scope here). Section CTA → full events listing.

**Hover behavior:** `EventCard` uses `Card`'s `interactive` variant (`hoverCard`, subtle lift +
`shadow-lg`) plus the image inside gets `hoverImage` (1.04 scale within its `overflow-hidden`
wrapper) — both trigger together on one hover, reinforcing "this whole card is one clickable unit."

**Animation:** Grid entrance uses `staggerChildren` (~60ms between cards) with `fadeUp` per card —
this is one of the few grids on the page where a visible stagger is worth it, since "upcoming
events" benefits from a light sense of a list revealing itself.

**Accessibility:** Each card is a single `<a>` wrapping the whole card content (not nested
interactive elements inside a clickable card — avoid a link-inside-a-link). `EventBadge`'s status
color is always paired with its text label (already built that way) so status is never color-only.

**Responsive behavior:** Grid steps `3 → 2 → 1` (or snap-scroll on mobile, per above) at `lg`/`sm`.

**Recommended spacing:** `Section spacing="md"`; `Grid gap="md"` (the default `--space-grid-gap`
token).

**Suggested imagery:** Real photos from past events of the same type (past kajian, past community
iftar, etc.) when the specific upcoming event doesn't have its own photo yet — never a generic stock
"people at a meeting" photo; if no relevant real photo exists, prefer a clean typographic card (no
image) over a mismatched stock photo.

---

## 7. Financial Transparency

**Purpose:** Build trust through openness about how the mosque's funds are managed — this section's
entire job is to make the Donation section (immediately following) feel safe to act on. Sequencing
matters: transparency *before* the ask, not after or nowhere.

**Content hierarchy:** `SectionHeader` ("Transparansi Keuangan") → `FinancialSummaryCard` containing
three `FinancialStat`s (e.g. Pemasukan / Pengeluaran / Saldo — Income / Expense / Balance, for the
current month) → link to the full, detailed report.

**Desktop layout:** `Container size="content"` even though other sections use the default width —
this section is about a small number of precise figures, not a wide visual composition; a
narrower, centered container keeps the numbers from feeling lost in whitespace. `FinancialSummaryCard`
already lays its children in a `Grid cols={3}` internally — one card, three stats, done. Below the
card, a quiet CTA row: "Unduh Laporan Lengkap (PDF)" and/or "Lihat Riwayat Bulanan →".

**Mobile layout:** Same card, its internal grid naturally reflows to the `Grid` primitive's
mobile-first collapse (3 → 1). CTA links stack.

**CTA:** "Unduh Laporan Lengkap" (secondary/outline button, downloads or links to a PDF/report page)
— this is a supporting CTA, not competing with Donation's primary CTA in the very next section; keep
it visually modest (outline, not filled primary).

**User interaction:** Static display of the current period's figures; CTA opens/downloads the full
report.

**Hover behavior:** None on the stat card itself (it's not interactive) — only the CTA link/button
gets a hover state. Resist the temptation to make the whole card "clickable" just because it looks
like it could be; a data summary that silently links somewhere unexpected is a trust cost in exactly
the section whose entire purpose is trust.

**Animation:** `fadeUp` once, no counting/odometer number animation. A "counting up" animation on
financial figures is a common fintech-marketing trick — for a mosque's transparency section it reads
as slightly showy for what should feel plain and honest; show the real number immediately.

**Accessibility:** `FinancialStat`'s trend indicator (already built to pair an icon + `trendLabel`
text, never color-only) is used correctly here. Numbers use `tabular-nums` (already built into
`FinancialStat`) so nothing visually jitters as values differ in digit count.

**Responsive behavior:** No special breakpoint behavior beyond the standard container/grid collapse
— this section is intentionally the calmest, least "designed" section on the page, which is itself
the point.

**Recommended spacing:** `Section spacing="md" background="muted"` — the `muted` band is what
visually separates this from the "quiet-background" sections around it without resorting to a
strong color, appropriate for its low-key, credible tone.

**Suggested imagery:** None. This is the one section on the homepage that is intentionally
image-free — pure typography and number, which itself communicates "no spin, just the facts."

---

## 8. Donation

**Purpose:** Beat 3 — the conversion moment. Ask directly, having just demonstrated (previous
section) that funds are handled transparently.

**Content hierarchy:** `SectionHeader` (centered this time — a direct ask reads better centered than
left-aligned, it's speaking *to* the visitor rather than narrating *about* the mosque) → one or more
`DonationCard`s (active campaigns — a building fund, an operational fund, a Ramadan program fund,
etc.) → primary CTA per card ("Donasi Sekarang").

**Desktop layout:** `SectionHeader align="center"`. If there's exactly one general fund, feature a
single, larger `DonationCard` centered (`Container size="content"`) with generous internal spacing —
a single strong ask beats a busy list. If there are multiple active campaigns, `Grid cols={3}` (or
2, depending on real count) of `DonationCard`s, each with its own `DonationProgress` bar and
"Donasi" button as the `action` slot.

**Mobile layout:** Single column stack, one `DonationCard` per row, full width.

**CTA:** "Donasi Sekarang" as each card's primary `Button` — this is the loudest, most
visually-weighted button on the entire homepage (larger than the navbar's Donasi button, larger than
Hero's CTAs) — it should be unmistakable which button on the page is *the* donation action.

**User interaction:** Click → payment/donation flow (external page or modal — out of scope for this
blueprint, but note it: this needs a real payment integration later, the homepage only needs to
launch that flow).

**Hover behavior:** `DonationCard` uses `hoverCard`; the "Donasi Sekarang" button itself additionally
gets slightly more presence on hover than other buttons on the page (e.g., a subtle shadow bloom in
addition to the standard `hoverButton` scale) — a small, deliberate exception that makes this one
button feel like the page's most important click.

**Animation:** `fadeUp` on scroll-in. `DonationProgress`'s bar fill should animate from 0 to its
actual value once, on first scroll into view (a `width` transition — already scoped as a `transition-
[width]` in the component) — this is one of the few places an animated fill is earned, since it
visually communicates "progress," which is the whole point of a progress bar existing.

**Accessibility:** `DonationProgress` already exposes `role="progressbar"` with
`aria-valuenow/min/max` — keep it. Each campaign's raised/goal amounts are always shown as text
alongside the bar (never bar-only), so screen reader and low-vision users get the same information
sighted users get from the fill length.

**Responsive behavior:** Standard grid collapse; button stays full-width on mobile card layouts for
an easy, unambiguous tap target.

**Recommended spacing:** `Section spacing="lg" background="secondary"` (the deep green) or a
photography band (real image of the mosque's community/facility being funded) with a scrim, similar
treatment to Hero but shorter — either choice works as a "beat," pick whichever the available
photography supports better. If using a flat `secondary` background, ensure `DonationCard`s sit on
`surface`-colored card bodies so they lift off the colored band clearly.

**Suggested imagery:** If a specific campaign is for a physical project (renovation, new wing,
water/sanitation facility), use a real photo of that specific space/need — specificity here builds
far more trust than a generic "hands giving money" stock photo, which should never appear anywhere
on this site.

---

## 9. Gallery

**Purpose:** Photographic proof of the mosque's life and architecture — the most visual, least
textual section on the page, a deliberate breathing space after the transactional weight of
Financial Transparency + Donation.

**Content hierarchy:** `SectionHeader` (brief, this section should mostly speak through images) →
`GalleryCard` grid → "Lihat Galeri Lengkap" CTA.

**Desktop layout:** `Grid cols={4}` (or 3, depending on real photo count/quality — prefer fewer,
stronger images over more, weaker ones) of `GalleryCard`s, mixed aspect ratios
(`square`/`video`/`portrait`, already supported) to avoid a monotonous uniform grid — an editorial
gallery varies its rhythm the way a print layout would, not a strict Instagram-style square grid.

**Mobile layout:** `Grid cols={2}`, or a horizontal snap-scroll row for a more "browsing" feel if the
image count is large (10+) — either is defensible; snap-scroll keeps initial page height shorter.

**CTA:** "Lihat Galeri Lengkap →" below the grid, links to a full gallery page (future work).

**User interaction:** Click a `GalleryCard` → lightbox (enlarged view) — out of scope to design in
full here, but note the intended behavior: opens an overlay at `zIndex.overlay`/`modal` (already
defined tokens), scrim per the design system's modal-legibility guidance, closes on Escape/backdrop
click/explicit close button.

**Hover behavior:** `GalleryCard` already has a built-in `hoverImage`-style scale
(`group-hover:scale-105`) plus its caption overlay (if present) — keep both, they reinforce the
same "this is interactive" signal together rather than fighting.

**Animation:** `staggerChildren` entrance (~40ms, tighter than the Events grid's stagger since
there are more items — a slower per-item stagger across 8 images would take too long to finish
revealing).

**Accessibility:** Every `alt` text is specific and real (already enforced — `GalleryCard.alt` has
no default). If a lightbox is added later, it must trap focus and be fully keyboard-dismissible
(Escape) per the design system's `modal-escape`/`escape-routes` guidance.

**Responsive behavior:** Grid/scroll switch as above; aspect ratios stay fixed per card regardless
of column count so the layout never shifts (`CLS`-safe).

**Recommended spacing:** `Section spacing="md"`; tighter `Grid gap="sm"` here specifically (denser
than other grids) — a gallery is allowed to feel a little more continuous/mosaic-like than a card
grid of distinct content items.

**Suggested imagery:** The real photo library — exterior at different times of day, interior
details (mihrab, minbar, calligraphy if present), community activity, seasonal (Ramadan iftar,
Eid gathering). This section is where volume of real photography matters most.

---

## 10. Social Media

**Purpose:** Convert homepage visitors into followers on the mosque's active channels
(`@masjidbaitulhikmah_` Instagram, `@masjidbaitulhikmah` TikTok) — where day-to-day updates
actually live, since the homepage itself won't be updated as often as a social feed.

**Content hierarchy:** `SectionHeader` (short — "Ikuti Kami") → two platform cards (Instagram,
TikTok), each with the platform's icon, handle, a one-line description of what's posted there, and
a follow CTA → optionally, `SocialLinks` repeated in the Footer too (that's fine — social links can
reasonably appear twice on a page: once as a real invitation here, once as quiet reference in the
Footer).

**Desktop layout:** `Grid cols={2}`, two `Card`s side by side, each roughly symmetric: platform icon
+ handle as the card's header, short description, "Follow" `Button` (`variant="outline"`, platform-
neutral styling — don't try to recreate Instagram/TikTok's own brand gradients here, that fights the
site's own palette; a plain, on-brand outline button with the platform's icon is enough
identification).

**Mobile layout:** Stack the two cards (`Grid cols={1}` or naturally via `cols={2}` collapsing).

**CTA:** "Follow on Instagram" / "Follow on TikTok" per card, opens the profile in a new tab.

**User interaction:** External link, `target="_blank" rel="noopener noreferrer"` (already the
pattern used in `SocialLinks`/`ContactCard`).

**Hover behavior:** Standard `hoverCard` + `hoverButton` — nothing platform-specific, keeps this
section visually consistent with every other card-based section rather than borrowing outside
motion/style languages.

**Animation:** `fadeUp`, no stagger needed for just two items (a stagger on two elements is barely
perceptible and not worth the added complexity).

**Accessibility:** Icons are decorative (`aria-hidden`) since the handle text and "Follow on X"
button label already convey the platform; button `aria-label`s are explicit
("Follow on Instagram", not just "Follow" ×2 which would be ambiguous to screen reader users
navigating by button list).

**Responsive behavior:** Standard 2→1 collapse.

**Recommended spacing:** `Section spacing="sm"` — this is one of the lightest, most compact sections
on the page; it doesn't need `md`/`lg` room to make its point.

**Suggested imagery:** Optional: a small strip of the 3–4 most recent post thumbnails inside each
card (if pulling from an oEmbed/API later — flagged explicitly as a future enhancement requiring a
live data source, not part of this presentational blueprint). Without that integration, icon +
handle + description is sufficient and keeps the section honestly static rather than faking a "live"
feed that isn't actually live.

---

## 11. Location

**Purpose:** Help visitors physically find the mosque — critical utility content, straightforward by
design.

**Content hierarchy:** `SectionHeader` ("Lokasi") → `LocationCard` (map slot + name + address +
"Get Directions") → optionally, quick facts alongside (parking availability, nearest landmark).

**Desktop layout:** Two-column: map (large, `aspect-video` or taller, using `LocationCard`'s
`mapSlot`) on one side, `LocationCard`'s text content + directions CTA on the other — or, simpler
and arguably calmer: a full-width map with the `LocationCard` text overlapping/anchored at one
corner (a common, premium "location block" pattern seen on hospitality/architecture sites). Prefer
the overlapping-card treatment for visual interest, since the rest of the page is fairly grid-heavy
already.

**Mobile layout:** Map full-width on top (shorter aspect ratio, e.g. `aspect-square`, to conserve
vertical scroll), `LocationCard`'s text content below it rather than overlapping (overlap treatments
rarely survive small-screen reflow gracefully).

**CTA:** "Get Directions" (already built into `LocationCard`, opens Google/Apple Maps with a
pre-filled destination).

**User interaction:** Map itself: if embedded as a real interactive `iframe` (Google Maps embed),
note it needs `loading="lazy"` and should not steal scroll focus (a known bad pattern with embedded
interactive maps — the page should scroll past it normally, only zoom/pan when the visitor
deliberately interacts inside the map area). If using a static map image instead (simpler, no
third-party script, faster), the whole thing becomes a single link to the directions.

**Hover behavior:** If a static map image, treat the whole block as a card with `hoverCard`. If a
live embed, no hover treatment needed — the map has its own native interaction affordances.

**Animation:** `fadeUp`, no motion within the map itself.

**Accessibility:** If using a live embed, provide the address as real, selectable text nearby (never
rely on an iframe map alone to convey the address to assistive tech). Directions link has a clear,
descriptive label (already: "Get directions" / customizable via `directionsLabel`).

**Responsive behavior:** Map aspect ratio changes by breakpoint as noted above to manage vertical
space on mobile.

**Recommended spacing:** `Section spacing="md"`.

**Suggested imagery:** The map itself is the "image" here — no additional photography needed, though
a small inset thumbnail of the mosque's street-facing entrance next to the address can help
first-time visitors recognize the building on arrival.

---

## 12. Contact

**Purpose:** Give visitors a direct way to reach the mosque administration for questions not
answered elsewhere (marriage/aqiqah bookings, general inquiries, volunteering).

**Content hierarchy:** `SectionHeader` ("Hubungi Kami") → grid of `ContactCard`s (Phone, WhatsApp,
Email, Address) → optional short contact form (Name, Email, Message) for written inquiries.

**Desktop layout:** Two-column: left column a compact `Grid cols={2}` (or a `Stack`) of
`ContactCard`s for the quick-contact methods; right column a short form (`Input` × 2, `Textarea`,
`Button`) inside a `Card`, for anyone who prefers writing in rather than calling/messaging.

**Mobile layout:** `ContactCard`s stack first (`Stack gap="sm"`), form below, full width.

**CTA:** Each `ContactCard` is itself a tappable CTA (`tel:`/`mailto:`/WhatsApp deep link, already
supported via `href`). Form's CTA is a single "Kirim Pesan" (Send Message) `Button`.

**User interaction:** Tapping a `ContactCard` launches the relevant native app (phone dialer,
WhatsApp, email client). The form is presentational only here — actual submission handling
(where the message goes) is backend work for a later phase; the UI should still look and behave
like a real form (client-side validation states, focus management) even before that backend exists.

**Hover behavior:** `ContactCard` already includes a hover background shift when `href` is present —
keep that; it's a correctly modest treatment (background tint, not scale/shadow, since these are
small dense rows, not big photographic cards).

**Animation:** `fadeUp`, `staggerChildren` across the `ContactCard`s (~50ms) since there are
typically 3–4 of them, similar treatment to the Events grid.

**Accessibility:** Form fields use real, visible `<label>`s (not placeholder-only — matches
`CLAUDE.md`/design-system forms guidance already established), required fields marked, inline
validation on blur (not on every keystroke), errors placed directly below their field with
`aria-live` announcement on submit failure. `ContactCard`'s icon is `aria-hidden`; the label/value
text pair already carries the meaning.

**Responsive behavior:** Two-column → one-column (form moves below the contact methods, not beside
them) at `md`.

**Recommended spacing:** `Section spacing="md"`.

**Suggested imagery:** None required — this section is functional/utility, consistent with Location
and Financial Transparency in staying calm and text-forward rather than photo-led.

---

## 13. Footer

**Purpose:** Close the page with a grounded, comprehensive reference block — every key link and
piece of contact info in one place, for visitors who scrolled all the way down looking for
"everything at once."

**Content hierarchy:** Logo + tagline (top) → link columns (Sitemap: About/Events/Gallery/Donation;
Resources: Prayer Times/Financial Report; Contact snippet) → `SocialLinks` row → divider →
copyright/legal line (bottom).

**Desktop layout:** `Container`, multi-column grid (`Grid cols={4}`: brand column wider/first,
then 2–3 link columns, matching common premium-site footer structure e.g. Stripe/Linear). Bottom
strip below a `Divider`: copyright text left, perhaps a small "Made with care for the community"
or similar closing line right — optional, not required.

**Mobile layout:** Columns stack (`Stack gap="lg"`), brand block first, then link groups in
sequence, `SocialLinks` row, divider, copyright — each link group can optionally be a
native `<details>`/accordion on mobile if the link count is large, to keep the footer from
becoming a very long scroll; only add that complexity if the real link count warrants it.

**CTA:** None primary — the footer is reference, not a pitch. (A small "Donasi" text link can exist
among the other Sitemap links, but it should not be styled as a button here — the button-level ask
already happened in Donation and Navbar; repeating a filled CTA in the footer dilutes it.)

**User interaction:** Standard link navigation; `SocialLinks` open in new tabs per its existing
implementation.

**Hover behavior:** Footer links get a simple color shift on hover (`text-surface/70 → text-surface`,
since footer sits on the dark `heading` background) — no underline-grow flourish here, footers
should feel calmer/quieter than the navbar even in their hover language.

**Animation:** None — the footer doesn't need a scroll-triggered entrance; by the time a visitor
reaches it they've already seen the page's motion vocabulary repeatedly, and a footer that animates
in like every other section starts to feel like padding rather than a natural resting point.

**Accessibility:** `<footer>` landmark; link columns are genuine lists (`<nav><ul>`) with a visually
hidden heading per column ("Sitemap", "Resources", "Contact") for screen reader navigation, even if
those headings are visually implicit through spacing/typography alone.

**Responsive behavior:** Column count steps down as above; the bottom copyright strip always stays a
single row until it must wrap on very narrow viewports.

**Recommended spacing:** `Section spacing="lg" background="heading"` — the transition into `heading`
(near-black teal) from whatever the Contact section used should read as an intentional close, not
an abrupt cutoff; generous top padding here specifically (`lg`) gives that transition room to be
felt rather than jarring.

**Suggested imagery:** None — logo mark only, same as Navbar, reinforcing the brand bookends of the
page (logo appears exactly twice: opens the page in the Navbar, closes it in the Footer).

---

## Cross-Section Consistency Checklist

Before implementation, confirm every section against these — this is what actually produces "the
homepage feels like one considered thing" rather than "thirteen sections built independently":

- [ ] Every section uses `Section` + `Container` from `components/layout` — no bespoke wrapper divs.
- [ ] Every section heading is an `<h2>` fed through `SectionHeader`'s `level` prop, except Hero's
      `<h1>` — heading hierarchy is sequential, never skips a level.
- [ ] Background variant of every section matches the rhythm table in §0.1 — no ad-hoc colors.
- [ ] Only three sections use `spacing="lg"` (Hero, Prayer Times, Donation/Footer at most four) —
      everything else `md`, Announcement Bar `sm`.
- [ ] Every grid entrance uses `fadeUp` + (where there are 3+ repeating items) `staggerChildren` —
      no section invents its own animation curve or duration outside `lib/motion.ts`.
- [ ] Exactly one filled `variant="primary"` button visible in the viewport at any scroll position
      that isn't also a nav/footer element — verify by scrolling the finished page slowly and
      checking nothing competes with Donation's CTA for visual weight.
- [ ] Every image has real, specific `alt` text; zero stock photography; zero decorative Islamic
      ornament motifs anywhere (patterns, arches-as-dividers, crescent icons used decoratively).
- [ ] Every interactive element ≥44×44px tap target, visible `:focus-visible` ring intact
      (don't override the global one per-component without a reason).
- [ ] Mobile pass: no section requires horizontal page scroll; the only intentional horizontal
      scroll regions are the two explicitly called out above (Prayer Times row, optionally Events).

---

*This blueprint is the plan. Next step, on explicit instruction: implement sections one at a time,
starting with the ones that establish the page's rhythm fastest to validate against — Navbar, Hero,
and Prayer Times.*
