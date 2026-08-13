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

// Homepage — all sections are now implemented and mounted.
export default async function Home() {
  const hero = await getCurrentHero();

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
        <About />
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
