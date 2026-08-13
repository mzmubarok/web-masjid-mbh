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

// Homepage — all sections are now implemented and mounted.
export default async function Home() {
  const [hero, about] = await Promise.all([getCurrentHero(), getCurrentAbout()]);

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
        <Events />
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
