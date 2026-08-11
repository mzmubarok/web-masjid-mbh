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

// Homepage — all sections are now implemented and mounted.
export default function Home() {
  return (
    <PageWrapper>
      <AnnouncementBar
        icon={<Megaphone />}
        message="Jadwal sholat Jumat berubah menjadi pukul 12.00 WIB mulai minggu ini."
        cta={{ label: "Selengkapnya", href: "#" }}
      />
      <Navbar transparent />
      <main id="main-content" className="flex-1">
        <Hero />
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
