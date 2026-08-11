"use client";

import { useEffect, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Stack } from "@/components/layout/Stack";
import { buttonVariants } from "@/components/ui/Button";
import { IconButton, iconButtonVariants } from "@/components/ui/IconButton";
import { EASE_PREMIUM } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "#tentang" },
  { label: "Kegiatan Masjid", href: "#kegiatan" },
  { label: "Laporan Keuangan", href: "#laporan-keuangan" },
  { label: "Infaq", href: "#infaq" },
  { label: "Galeri", href: "#galeri" },
  { label: "Kontak", href: "#kontak" },
];

const DEFAULT_CTA: NavItem = { label: "Infaq", href: "#infaq" };

// Sticky-shadow/solid-background kicks in once the page has scrolled past this point.
const SCROLL_THRESHOLD = 8;

interface NavLinkProps extends ComponentPropsWithoutRef<"a"> {
  href: string;
}

/**
 * Same-page "#anchor" hrefs render as a plain `<a>` — the browser's native
 * hash navigation (plus the global `scroll-behavior: smooth`) reliably
 * scrolls to the target every time. `next/link`'s client-side router can
 * silently no-op a hash-only change when the pathname doesn't change,
 * which is what made "Kontak" not scroll. Real routes (e.g. "/") still use
 * `next/link` for client-side navigation.
 */
function NavLink({ href, children, ...props }: NavLinkProps) {
  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}

export interface NavbarProps {
  siteName?: string;
  logoSrc?: string;
  /**
   * Logo variant used while `transparent` and not yet scrolled — needs to
   * read on a dark backdrop. No light/white variant of `logoSrc` exists yet,
   * so this intentionally stays a different (horizontal, white) asset from
   * the primary logo rather than rendering illegibly over the Hero photo.
   */
  logoSrcTransparent?: string;
  navItems?: NavItem[];
  cta?: NavItem;
  /**
   * Starts transparent with a light/inverted logo and text, for placement over
   * a dark Hero — becomes solid `surface` once the page scrolls. Leave `false`
   * (default) when nothing dark sits behind the navbar yet.
   */
  transparent?: boolean;
  className?: string;
}

// Both source SVGs ship on an oversized 1080x1080 canvas with a lot of dead
// transparent space around the actual mark — their `viewBox`es were cropped
// tight to content (see public/logos/*.svg) so these ratios reflect what
// actually renders, not the original canvas. They're genuinely different
// shapes (the tagline lockup is denser/taller than the plain wordmark), so
// each needs its own intrinsic width/height for the browser to size it
// without distortion.
const LOGO_DIMENSIONS = {
  solid: { width: 990, height: 405 },
  transparent: { width: 1080, height: 270 },
} as const;

/** Sticky primary site navigation — desktop inline nav, mobile slide-in panel. */
export function Navbar({
  siteName = "Masjid Baitul Hikmah Gondolayu Lor",
  logoSrc = "/logos/logo-with-tagline.svg",
  logoSrcTransparent = "/logos/logo-horizontal-white.svg",
  navItems = DEFAULT_NAV_ITEMS,
  cta = DEFAULT_CTA,
  transparent = false,
  className,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const updateScrolled = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrolled);
      }
    };
    updateScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Once scrolled, a transparent navbar always resolves to the solid look.
  const solid = !transparent || scrolled;
  const logoDimensions = solid ? LOGO_DIMENSIONS.solid : LOGO_DIMENSIONS.transparent;

  return (
    <header
      className={cn(
        // Pinned to the viewport top and always transparent-capable — Hero
        // pulls up underneath it (see Hero.tsx's matching negative margin)
        // so the photo shows through instead of a blank strip above it.
        "sticky top-0 z-40 transition-[background-color,backdrop-filter,box-shadow] duration-300",
        solid ? "bg-surface/90 backdrop-blur-md" : "bg-transparent",
        solid && scrolled && "shadow-sm",
        className
      )}
    >
      <Container
        className={cn(
          // `items-center` in both states keeps the logo, nav links, and CTA
          // on the same horizontal baseline. The bar itself is ultra-slim
          // once scrolled solid (item 2); while transparent and floating
          // over the Hero it's a little taller, giving the logo real
          // breathing room above the Hero content below it (item 1) without
          // the bar itself feeling bulky.
          "flex items-center justify-between gap-8 transition-[height] duration-300 lg:gap-10",
          solid ? "h-[64px] sm:h-[72px] lg:h-[80px]" : "h-20 sm:h-24 lg:h-28"
        )}
      >
        <Link href="/" className="shrink-0" aria-label={siteName}>
          {/* The primary branding element of the header. Both source SVGs
              were cropped to their actual content (see LOGO_DIMENSIONS) —
              with the dead space gone, the mark itself reads larger even at
              this much shorter height than before. */}
          <Image
            src={solid ? logoSrc : logoSrcTransparent}
            alt={siteName}
            width={logoDimensions.width}
            height={logoDimensions.height}
            priority
            className={cn("w-auto", solid ? "h-12 sm:h-14 lg:h-16" : "h-10 sm:h-11 lg:h-12")}
          />
        </Link>

        {/* Fills the space between logo and CTA — right-aligned while
            transparent (balances the composition over the Hero), smoothly
            recentering once scrolled (`layout` animates the `<ul>` between
            the two `justify-*` positions instead of jumping). */}
        <nav aria-label="Primary" className="hidden lg:flex lg:flex-1 lg:items-center">
          <motion.ul
            layout
            transition={{ duration: 0.3, ease: EASE_PREMIUM }}
            className={cn("flex w-full items-center gap-4", solid ? "justify-center" : "justify-end")}
          >
            {navItems.map((item) => {
              const active = item.href === pathname;
              return (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative text-small font-medium whitespace-nowrap after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-current after:transition-transform after:duration-150 hover:after:scale-x-100",
                      active && "after:scale-x-100",
                      solid ? "text-foreground" : "text-surface"
                    )}
                  >
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </motion.ul>
        </nav>

        <NavLink
          href={cta.href}
          className={cn(buttonVariants({ variant: "primary", size: "sm" }), "hidden lg:inline-flex")}
        >
          {cta.label}
        </NavLink>

        <IconButton
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-panel"
          variant="ghost"
          className={cn("lg:hidden", !solid && "text-surface hover:bg-surface/10")}
          onClick={() => setMobileOpen(true)}
        >
          <Menu aria-hidden />
        </IconButton>
      </Container>

      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-heading/50 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup
            id="mobile-nav-panel"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-surface p-(--space-card-padding) shadow-xl outline-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full"
          >
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-h4 font-heading text-heading">Menu</Dialog.Title>
              <Dialog.Close
                className={cn(iconButtonVariants({ variant: "ghost" }))}
                aria-label="Close menu"
              >
                <X aria-hidden />
              </Dialog.Close>
            </div>

            <nav aria-label="Mobile" className="mt-10">
              <Stack gap="lg">
                {navItems.map((item) => {
                  const active = item.href === pathname;
                  return (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "text-h4 font-heading",
                        active ? "text-primary" : "text-heading"
                      )}
                    >
                      {item.label}
                    </NavLink>
                  );
                })}
              </Stack>
            </nav>

            <NavLink
              href={cta.href}
              onClick={() => setMobileOpen(false)}
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-auto w-full")}
            >
              {cta.label}
            </NavLink>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
