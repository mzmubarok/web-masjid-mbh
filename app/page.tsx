import { Megaphone } from "lucide-react";
import { PageWrapper } from "@/components/layout";
import {
  AnnouncementBar,
  Navbar,
  Hero,
  About,
  Events,
  Financial,
  Infaq,
  Gallery,
  SocialMedia,
  Location,
  Footer,
} from "@/components/sections";
import { getCurrentHero } from "@/lib/hero/hero";
import { getCurrentAbout } from "@/lib/about/about";
import { getHijriOverrideForDate } from "@/lib/hijri/hijri-overrides";
import { formatHijriDate } from "@/lib/hijri/format-hijri-date";
import { getUpcomingEvents } from "@/lib/events/events";
import { formatEventDate, formatEventTime } from "@/lib/events/format-event";
import { parseDateOnly } from "@/lib/date";
import type { BadgeProps } from "@/components/ui/Badge";

// EventCategory has no field that maps onto Badge's fixed tone enum
// (its own `color` is a freeform hex string) — so the landing page's
// existing 3-tone rotation is reapplied by position instead, exactly as
// About.tsx already does for Tagline icons: the CMS manages the content,
// the landing page manages the visual identity.
const EVENT_CATEGORY_TONES: NonNullable<BadgeProps["tone"]>[] = ["primary", "accent", "secondary"];

// Same Asia/Jakarta convention already hardcoded in Hero.tsx's own
// getTodayGregorianDate and in usePrayerCountdown — reused here (not a new
// timezone source) purely to look up "today's" HijriOverride, in the same
// zone-parts style usePrayerCountdown already uses.
function getTodayDateKeyInJakarta(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// Homepage — all sections are now implemented and mounted.
export default async function Home() {
  const todayJakarta = parseDateOnly(getTodayDateKeyInJakarta());

  const [hero, about, hijriOverride, upcomingEvents] = await Promise.all([
    getCurrentHero(),
    getCurrentAbout(),
    todayJakarta ? getHijriOverrideForDate(todayJakarta) : null,
    getUpcomingEvents(),
  ]);

  return (
    <PageWrapper>
      <AnnouncementBar
        icon={<Megaphone />}
        message="Jadwal sholat Jumat berubah menjadi pukul 12.00 WIB mulai minggu ini."
        cta={{ label: "Selengkapnya", href: "#" }}
      />
      <Navbar transparent />
      <main id="main-content" className="flex-1">
        <Hero
          // Only plain strings cross into the Client Component — never the
          // Hero/Media records themselves. Omitted (undefined) falls back to
          // Hero's own existing hardcoded defaults, unchanged.
          mosqueName={hero?.title ?? undefined}
          tagline={hero?.subtitle ?? undefined}
          imageSrc={hero?.backgroundImage?.storagePath ?? undefined}
          imageAlt={hero?.backgroundImage?.altText ?? undefined}
          // Only set when an override exists for today — otherwise omitted,
          // preserving Hero's existing hardcoded hijriDate fallback exactly
          // (there is no automatic Hijri calculation to fall back to; see
          // report). formatHijriDate matches Hero's own "12 Ramadan 1447 H"
          // style so both sources render consistently.
          hijriDate={
            hijriOverride
              ? formatHijriDate(hijriOverride.hijriDay, hijriOverride.hijriMonth, hijriOverride.hijriYear)
              : undefined
          }
        />
        <About
          // Only plain strings/objects cross into the Client Component —
          // never the About record itself. Omitted (undefined) falls back
          // to About's own existing hardcoded defaults, unchanged.
          title={about?.title ?? undefined}
          introduction={about?.introduction ?? undefined}
          facts={
            about
              ? [
                  { label: "Sejarah", description: about.history },
                  { label: "Visi", description: about.vision },
                  { label: "Misi", description: about.mission },
                ]
              : undefined
          }
          // Icons are never CMS-driven (see About.tsx's VALUE_ICONS) — only
          // title/description cross the boundary, mapped onto the existing
          // icons by position.
          valueItems={about?.taglines.map((tagline) => ({
            title: tagline.title,
            description: tagline.description,
          }))}
        />
        <Events
          // Only plain strings cross into the Client Component — never the
          // Event/EventCategory/Media records themselves. Omitted
          // (undefined, when there are no upcoming published events) falls
          // back to Events' own existing hardcoded defaults, unchanged.
          events={
            upcomingEvents.length > 0
              ? upcomingEvents.map((event, index) => ({
                  title: event.title,
                  category: event.category.name,
                  categoryTone: EVENT_CATEGORY_TONES[index % EVENT_CATEGORY_TONES.length],
                  date: formatEventDate(event.startDate),
                  time: formatEventTime(event.startTime),
                  location: event.location,
                  // No dedicated event photo -> omitted, so EventCard renders
                  // its own neutral placeholder instead of borrowing Hero's
                  // unrelated photograph.
                  imageSrc: event.featuredImage?.storagePath,
                  imageAlt: event.featuredImage?.altText ?? undefined,
                  href: `/kegiatan/${event.slug}`,
                }))
              : undefined
          }
        />
        <Financial />
        <Infaq />
        <Gallery />
        <SocialMedia />
        <Location />
      </main>
      <Footer />
    </PageWrapper>
  );
}
