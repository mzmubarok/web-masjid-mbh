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
import { getPrayerSettings } from "@/lib/prayer/prayer-settings";
import { calculatePrayerTimes } from "@/lib/prayer/calculate-prayer-times";
import { applyPrayerIhtiyath } from "@/lib/prayer/apply-prayer-ihtiyath";
import { ceilPrayerTimesToMinute } from "@/lib/prayer/ceil-prayer-times";
import { formatPrayerSchedule } from "@/lib/prayer/format-prayer-schedule";
import { getUpcomingEvents } from "@/lib/events/events";
import { formatEventDate, formatEventTime } from "@/lib/events/format-event";
import { getFeaturedGalleryAlbums } from "@/lib/gallery/gallery-albums";
import { getHomepageFinancialSummaries } from "@/lib/finance/financial-reports";
import { formatFinancialAmount, formatReportPeriod } from "@/lib/finance/format-finance";
import { getFeaturedDonationProgram } from "@/lib/donations/donation-programs";
import { getContactLocation } from "@/lib/contact/contact-location";
import { toWhatsAppHref, formatOperatingHours } from "@/lib/contact/format-contact";
import { getActiveSocialMediaLinks } from "@/lib/social-media/social-media";
import { getSiteSettings } from "@/lib/settings/site-settings";
import { parseDateOnly, formatGregorianDate } from "@/lib/date";
import type { BadgeProps } from "@/components/ui/Badge";

// Bounds how stale the homepage's date-derived content (Gregorian date,
// Hijri override lookup, prayer schedule — see todayJakarta below) can get
// after a static-generation cutover, without paying force-dynamic's cost of
// re-running every query on every request. A full 24h window would be
// measured from whenever the page last happened to regenerate (e.g. an
// unrelated admin edit), not from midnight itself, so it could leave the
// wrong day showing for most of the next day; an hourly window bounds that
// worst case to under an hour while still cutting regenerations ~24x
// against force-dynamic for any real traffic volume.
export const revalidate = 3600;

// EventCategory has no field that maps onto Badge's fixed tone enum
// (its own `color` is a freeform hex string) — so the landing page's
// existing 3-tone rotation is reapplied by position instead, exactly as
// About.tsx already does for Tagline icons: the CMS manages the content,
// the landing page manages the visual identity.
const EVENT_CATEGORY_TONES: NonNullable<BadgeProps["tone"]>[] = ["primary", "accent", "secondary"];

// FinancialProgram.color is a freeform hex string, not FinancialSummaryCard's
// fixed 3-value tone enum — reapplied by position instead, same reasoning as
// EVENT_CATEGORY_TONES above.
const FINANCIAL_FUND_TONES: Array<"primary" | "secondary" | "accent"> = ["primary", "secondary", "accent"];

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

/** The most recent (month, year) among a set of reports — so "Terakhir diperbarui" reflects the newest figure actually shown, not "now". */
function latestReportPeriod(
  reports: { reportMonth: number; reportYear: number }[]
): [month: number, year: number] {
  return reports.reduce<[number, number]>(
    (latest, report) =>
      report.reportYear > latest[1] || (report.reportYear === latest[1] && report.reportMonth > latest[0])
        ? [report.reportMonth, report.reportYear]
        : latest,
    [reports[0].reportMonth, reports[0].reportYear]
  );
}

// Homepage — all sections are now implemented and mounted.
export default async function Home() {
  const todayJakarta = parseDateOnly(getTodayDateKeyInJakarta());

  const [
    hero,
    about,
    hijriOverride,
    prayerSettings,
    upcomingEvents,
    galleryAlbums,
    financialSummaries,
    featuredDonationProgram,
    contactLocation,
    socialLinks,
    siteSettings,
  ] = await Promise.all([
    getCurrentHero(),
    getCurrentAbout(),
    todayJakarta ? getHijriOverrideForDate(todayJakarta) : null,
    getPrayerSettings(),
    getUpcomingEvents(),
    getFeaturedGalleryAlbums(),
    getHomepageFinancialSummaries(),
    getFeaturedDonationProgram(),
    getContactLocation(),
    getActiveSocialMediaLinks(),
    getSiteSettings(),
  ]);

  // Reuses todayJakarta (already computed above for the Hijri override
  // lookup) as the calculation date — no second "what day is it" source.
  // Omitted (undefined) when no PrayerSetting row exists yet, falling back
  // to Hero's own hardcoded DEFAULT_SCHEDULE, unchanged. Every value
  // reaching Hero is already final — Ihtiyath and ceiling-minute rounding
  // both happen here, backend-side, before formatting; Hero and the
  // countdown it drives only ever display these strings, never adjust them.
  const todaySchedule =
    prayerSettings && todayJakarta
      ? formatPrayerSchedule(
          ceilPrayerTimesToMinute(applyPrayerIhtiyath(calculatePrayerTimes(prayerSettings, todayJakarta), prayerSettings)),
          prayerSettings.timezone
        )
      : undefined;

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
          // Reuses the exact same todayJakarta used for the Hijri override
          // lookup and the prayer calculation below — previously omitted,
          // which let Hero fall back to computing its own "now" client-side
          // (always live) while Hijri/Prayer stayed frozen at last static
          // generation, so the two could disagree across a day boundary.
          // Passing it here guarantees all three always refer to the same
          // "today" (see report's Requirement 3 fix).
          gregorianDate={todayJakarta ? formatGregorianDate(todayJakarta) : undefined}
          // Calculated from PrayerSetting via adhan — see lib/prayer/. Only
          // plain {name, time} objects cross into the Client Component;
          // icons are never CMS-driven and stay resolved inside Hero itself
          // (see PRAYER_ICON_BY_NAME). Omitted (undefined, when no
          // PrayerSetting row exists yet) falls back to Hero's own
          // hardcoded DEFAULT_SCHEDULE, unchanged.
          schedule={todaySchedule}
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
        <Financial
          // Only plain strings cross into the Client Component — never the
          // FinancialProgram/FinancialReport records themselves. Omitted
          // (undefined, when no active homepage-visible program has a
          // published report yet) falls back to Financial's own existing
          // hardcoded defaults, unchanged. Row labels ("Total Dana",
          // "Pemasukan Bulan Ini", ...) have no matching CMS field — no
          // field carries per-fund label wording — so they stay fixed
          // instead of being fabricated per program.
          funds={
            financialSummaries.length > 0
              ? financialSummaries.map(({ program, report }, index) => ({
                  name: program.name,
                  description: program.description ?? undefined,
                  tone: FINANCIAL_FUND_TONES[index % FINANCIAL_FUND_TONES.length],
                  primaryStat: { label: "Total Dana", value: formatFinancialAmount(report.totalFund) },
                  secondaryStats: [
                    { label: "Pemasukan Bulan Ini", value: formatFinancialAmount(report.monthlyIncome) },
                    { label: "Pengeluaran Bulan Ini", value: formatFinancialAmount(report.monthlyExpense) },
                  ],
                  currentBalance: { label: "Saldo Saat Ini", value: formatFinancialAmount(report.currentBalance) },
                }))
              : undefined
          }
          // The most recent period among the reports actually shown above —
          // not "now", so the label never claims a report is fresher than it is.
          lastUpdated={
            financialSummaries.length > 0
              ? formatReportPeriod(...latestReportPeriod(financialSummaries.map(({ report }) => report)))
              : undefined
          }
        />
        <Infaq
          // Only plain strings cross into the Client Component — never the
          // DonationProgram/Media record itself. Omitted (undefined, when no
          // donation program is published) falls back to Infaq's own
          // existing hardcoded defaults, unchanged. `eyebrow`, `trustIndicators`,
          // and both CTAs have no matching DonationProgram field/reachable
          // route — left untouched (see report's Architectural Findings).
          title={featuredDonationProgram?.name ?? undefined}
          subtitle={featuredDonationProgram?.shortDescription ?? undefined}
          // Reuses the same already-fetched `siteSettings` Footer reads
          // below — no second query. Bank fields feed the donation modal
          // opened by "Salurkan Infaq"; all optional, the modal itself
          // handles none being configured yet.
          bankName={siteSettings?.bankName ?? undefined}
          bankAccountName={siteSettings?.bankAccountName ?? undefined}
          bankAccountNumber={siteSettings?.bankAccountNumber ?? undefined}
        />
        <Gallery
          // Only plain strings cross into the Client Component — never the
          // GalleryAlbum/Media records themselves. Omitted (undefined, when
          // there are no published albums with a cover image) falls back to
          // Gallery's own existing hardcoded defaults, unchanged.
          items={
            galleryAlbums.length > 0
              ? galleryAlbums.map((album) => ({
                  src: album.coverImage.storagePath,
                  alt: album.coverImage.altText ?? album.coverImage.fileName,
                  title: album.title,
                  date: album.eventDate ? formatEventDate(album.eventDate) : undefined,
                  href: `/galeri/${album.slug}`,
                }))
              : undefined
          }
        />
        <SocialMedia
          // Reuses the same `socialLinks` already fetched for Footer — no
          // second query; getActiveSocialMediaLinks() now also includes
          // each platform's published SocialMediaPost rows. Instagram/TikTok
          // are matched by platform name, same case-insensitive convention
          // Footer's socialPlatformIcon already uses. Only plain
          // {id, postUrl} objects cross the boundary — never the Prisma
          // SocialMediaPost records themselves; `platforms`' own hardcoded
          // copy is untouched, per this task's scope. Empty arrays (no
          // published posts) keep the existing placeholder preview grid
          // exactly as before.
          instagramPosts={socialLinks
            .find((link) => link.platform.toLowerCase().includes("instagram"))
            ?.posts.map((post) => ({ id: post.id, postUrl: post.postUrl }))}
          tiktokPosts={socialLinks
            .find((link) => link.platform.toLowerCase().includes("tiktok"))
            ?.posts.map((post) => ({ id: post.id, postUrl: post.postUrl }))}
        />
        <Location
          // Only plain strings/objects cross into the Client Component —
          // never the ContactLocation record itself; icons stay
          // presentation-only, resolved inside Location.tsx by label (see
          // its DETAIL_ICON_BY_LABEL note), matching Footer's precedent.
          // Omitted (undefined) falls back to Location's own existing
          // hardcoded defaults, unchanged. `title`/`eyebrow` and the
          // Directions URL are intentionally left untouched — no matching
          // CMS field exists for the section's own heading, and Directions
          // URL is out of scope for this task.
          mosqueName={contactLocation?.mosqueName ?? undefined}
          subtitle={contactLocation?.shortDescription ?? undefined}
          details={
            contactLocation
              ? [
                  { label: "Alamat", value: `${contactLocation.address}, ${contactLocation.city}` },
                  {
                    label: "Jam Operasional",
                    value: formatOperatingHours(
                      contactLocation.openingTime,
                      contactLocation.closingTime,
                      contactLocation.operatingNotes
                    ),
                  },
                  {
                    label: "Parkir",
                    // Same hardcoded sentence Location.tsx's own default
                    // uses — the CMS field is optional, so an admin who
                    // hasn't filled it in yet sees the same fallback text
                    // as before, not a blank row.
                    value:
                      contactLocation.parkingDescription ??
                      "Tersedia area parkir motor dan mobil di halaman masjid",
                  },
                  {
                    label: "Aksesibilitas",
                    value:
                      contactLocation.accessibilityDescription ??
                      "Akses ramah kursi roda tersedia melalui pintu utama",
                  },
                ]
              : undefined
          }
          mapEmbedSrc={contactLocation?.googleMapsEmbedUrl ?? undefined}
          googleMapsHref={contactLocation?.googleMapsUrl ?? undefined}
        />
      </main>
      <Footer
        // Only plain strings/objects cross into Footer — icons stay
        // presentation-only and are resolved inside Footer.tsx itself (see
        // its FooterSocialItem/CONTACT_ICON_BY_LABEL notes), never CMS-driven,
        // matching About's VALUE_ICONS precedent. Omitted (undefined) falls
        // back to Footer's own existing hardcoded defaults, unchanged.
        mosqueName={siteSettings?.siteName ?? undefined}
        contactItems={
          contactLocation
            ? [
                { label: "Alamat", value: `${contactLocation.address}, ${contactLocation.city}` },
                ...(contactLocation.whatsapp
                  ? [
                      {
                        label: "WhatsApp",
                        value: contactLocation.whatsapp,
                        href: toWhatsAppHref(contactLocation.whatsapp),
                      },
                    ]
                  : []),
                ...(contactLocation.email
                  ? [{ label: "Email", value: contactLocation.email, href: `mailto:${contactLocation.email}` }]
                  : []),
              ]
            : undefined
        }
        socialLinks={
          socialLinks.length > 0
            ? socialLinks.map((link) => ({ label: link.platform, href: link.url }))
            : undefined
        }
        // copyrightHolder intentionally NOT wired to SiteSetting.copyrightText —
        // see report's Architectural Findings: that field holds the full
        // copyright line ("© 2026 Masjid. All rights reserved.", confirmed
        // from real data), but Footer's own "© {copyrightYear} {copyrightHolder}"
        // already prepends "©" + year, so wiring it verbatim would duplicate
        // both. Fixing that would mean restructuring Footer's copyright line,
        // which is out of scope ("do not redesign"). Left on its existing
        // hardcoded default.
        smallPrint={siteSettings?.footerDescription ?? undefined}
      />
    </PageWrapper>
  );
}
