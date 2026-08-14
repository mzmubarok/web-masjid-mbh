import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, Image as ImageIcon, Mail, MapPin, MessageCircle, Video } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Stack } from "@/components/layout/Stack";
import { Grid } from "@/components/layout/Grid";
import { Divider } from "@/components/ui/Divider";
import { SocialLinks } from "@/components/common";
import type { SocialLink } from "@/components/common";
import { cn } from "@/lib/utils";

export interface FooterNavItem {
  label: string;
  href: string;
}

export interface FooterContactItem {
  label: string;
  value: string;
  href?: string;
}

// SocialMedia.icon (CMS) is an uploaded Media image, not a vector icon, so it
// can't feed SocialLinks' `icon: ReactNode` slot without swapping in a raster
// image and changing the existing look — same reasoning as About.tsx's
// VALUE_ICONS. Icon selection stays presentation-only, matched by label
// instead of being CMS-driven.
export interface FooterSocialItem {
  label: string;
  href: string;
}

const CONTACT_ICON_BY_LABEL: Record<string, ComponentType<{ className?: string }>> = {
  Alamat: MapPin,
  WhatsApp: MessageCircle,
  Email: Mail,
};

function socialPlatformIcon(platform: string): ComponentType<{ className?: string }> {
  const normalized = platform.toLowerCase();
  if (normalized.includes("tiktok") || normalized.includes("youtube") || normalized.includes("video")) {
    return Video;
  }
  if (normalized.includes("instagram") || normalized.includes("photo")) {
    return ImageIcon;
  }
  return Globe;
}

// Kept in sync with Navbar's anchors — Prayer Times no longer has its own
// section (it now lives inside Hero), and Donation was renamed to Infaq.
const DEFAULT_NAV_ITEMS: FooterNavItem[] = [
  { label: "Tentang Kami", href: "#tentang" },
  { label: "Kegiatan", href: "#kegiatan" },
  { label: "Infaq", href: "#infaq" },
  { label: "Galeri", href: "#galeri" },
  { label: "Kontak", href: "#kontak" },
];

const DEFAULT_CONTACT_ITEMS: FooterContactItem[] = [
  {
    label: "Alamat",
    value: "Jl. Gondolayu Lor, Yogyakarta",
  },
  {
    label: "WhatsApp",
    value: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890",
  },
  {
    label: "Email",
    value: "info@masjidbaitulhikmah.or.id",
    href: "mailto:info@masjidbaitulhikmah.or.id",
  },
];

const DEFAULT_SOCIAL_LINKS: FooterSocialItem[] = [
  { label: "Instagram", href: "https://instagram.com/masjidbaitulhikmah_" },
  { label: "TikTok", href: "https://tiktok.com/@masjidbaitulhikmah" },
];

export interface FooterProps {
  mosqueName?: string;
  logoSrc?: string;
  navItems?: FooterNavItem[];
  contactItems?: FooterContactItem[];
  socialLinks?: FooterSocialItem[];
  /** @default the current year */
  copyrightYear?: number;
  copyrightHolder?: string;
  smallPrint?: string;
  /** Anchor id — Navbar's "Kontak" link points to `#kontak` by default. */
  id?: string;
  className?: string;
}

/**
 * Site footer — the homepage's closing band. Every list (nav items, contact
 * methods, social links) is a prop with placeholder defaults, so a CMS can
 * edit or reorder them later without any change to this component. No
 * business logic lives here — `copyrightYear` defaults to the real current
 * year via `Date`, not a hardcoded value, but nothing is fetched or computed
 * beyond that.
 */
export function Footer({
  mosqueName = "Masjid Baitul Hikmah Gondolayu Lor",
  logoSrc = "/logos/logo-white.svg",
  navItems = DEFAULT_NAV_ITEMS,
  contactItems = DEFAULT_CONTACT_ITEMS,
  socialLinks = DEFAULT_SOCIAL_LINKS,
  copyrightYear = new Date().getFullYear(),
  copyrightHolder = "Masjid Baitul Hikmah Gondolayu Lor",
  smallPrint = "Dibuat untuk kemaslahatan umat.",
  id = "kontak",
  className,
}: FooterProps) {
  // Icons are resolved here, not passed in as props — see FooterSocialItem's
  // note above and CONTACT_ICON_BY_LABEL.
  const resolvedSocialLinks: SocialLink[] = socialLinks.map((link) => {
    const Icon = socialPlatformIcon(link.label);
    return { ...link, icon: <Icon aria-hidden /> };
  });

  return (
    <Section
      as="footer"
      id={id}
      background="heading"
      // "md" — matches the rest of the site's section rhythm instead of the
      // heavier "lg" the footer previously carried; internal Grid/Stack
      // gaps (nav columns, contact list, social links) are untouched.
      spacing="md"
      // Keeps the "Kontak" target clear of the sticky Navbar when jumped to
      // — matches Navbar's compact *scrolled* height (see Navbar.tsx),
      // since the navbar is always in that state by the time Footer is reached.
      className={cn("scroll-mt-[64px] sm:scroll-mt-[72px] lg:scroll-mt-[80px]", className)}
    >
      <Container>
        <Stack gap="lg">
          <Grid cols={4} gap="lg">
            {/* Logo-only branding — this is now the footer's visual identity,
                so it carries the accessible name itself instead of adjacent
                text (previously handled by `Logo`'s name+tagline pairing). */}
            <div className="flex items-start">
              <Image
                src={logoSrc}
                alt={mosqueName}
                width={160}
                height={160}
                className="h-auto w-32 sm:w-40"
              />
            </div>

            <nav aria-label="Footer">
              <Stack gap="sm">
                <span className="text-label text-surface/50">Navigasi</span>
                <Stack as="ul" gap="sm">
                  {navItems.map((item) => {
                    // Plain `<a>` for same-page "#anchor" hrefs — see the
                    // matching note in Navbar.tsx (`next/link` can no-op a
                    // hash-only change since the pathname doesn't move).
                    const className =
                      "text-small text-surface/80 transition-colors duration-200 hover:text-surface";
                    return (
                      <li key={item.href}>
                        {item.href.startsWith("#") ? (
                          <a href={item.href} className={className}>
                            {item.label}
                          </a>
                        ) : (
                          <Link href={item.href} className={className}>
                            {item.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </Stack>
              </Stack>
            </nav>

            <div>
              <Stack gap="sm">
                <span className="text-label text-surface/50">Kontak</span>
                <Stack gap="sm">
                  {contactItems.map((item) => {
                    const Icon = CONTACT_ICON_BY_LABEL[item.label] ?? MapPin;
                    const value = (
                      <span className="inline-flex items-start gap-2 text-small text-surface/80">
                        <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                        {item.value}
                      </span>
                    );
                    return (
                      <div key={item.label}>
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors duration-200 hover:text-surface"
                          >
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </div>
                    );
                  })}
                </Stack>
              </Stack>
            </div>

            <Stack gap="sm">
              <span className="text-label text-surface/50">Media Sosial</span>
              <SocialLinks links={resolvedSocialLinks} tone="inverted" className="-ml-2.5" />
            </Stack>
          </Grid>

          <Divider className="bg-surface/10" />

          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-caption text-surface/60">
              © {copyrightYear} {copyrightHolder}
            </p>
            <p className="text-caption text-surface/60">{smallPrint}</p>
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
