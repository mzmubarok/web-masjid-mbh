"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { Accessibility, Car, Clock3, MapPin, Navigation } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Stack } from "@/components/layout/Stack";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { buttonVariants } from "@/components/ui/Button";
import { fadeRight, fadeUp, staggerChildren } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface LocationDetail {
  label: string;
  value: string;
}

// ContactLocation (CMS) has no per-detail icon field — icon selection stays
// presentation-only, resolved by label, same reasoning as Footer's
// CONTACT_ICON_BY_LABEL. The four labels below are structural (always the
// same four rows), so matching by label is safe regardless of CMS content.
const DETAIL_ICON_BY_LABEL: Record<string, ComponentType<{ className?: string }>> = {
  Alamat: MapPin,
  "Jam Operasional": Clock3,
  Parkir: Car,
  Aksesibilitas: Accessibility,
};

const DEFAULT_DETAILS: LocationDetail[] = [
  {
    label: "Alamat",
    value: "Jl. Gondolayu Lor, Yogyakarta, Daerah Istimewa Yogyakarta",
  },
  {
    label: "Jam Operasional",
    value: "Setiap hari, 04.00 – 21.00 WIB",
  },
  {
    label: "Parkir",
    value: "Tersedia area parkir motor dan mobil di halaman masjid",
  },
  {
    label: "Aksesibilitas",
    value: "Akses ramah kursi roda tersedia melalui pintu utama",
  },
];

export interface LocationProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  mosqueName?: string;
  /** The four detail rows — a prop, so a CMS can edit/reorder them later. */
  details?: LocationDetail[];
  /**
   * Google Maps Embed URL. Omit to show a placeholder — the same container
   * renders a live `<iframe>` the moment this is provided, no other change
   * needed once Maps integration is ready.
   */
  mapEmbedSrc?: string;
  googleMapsHref?: string;
  directionsHref?: string;
  /** Anchor id — no Navbar link points here yet, kept for consistency with other sections. */
  id?: string;
  className?: string;
}

/**
 * "Visit us" section — two-column desktop layout: map placeholder on the
 * left, mosque details and directions CTAs on the right. Presentational
 * only; every string and the map source are props with placeholder
 * defaults, ready for a future Google Maps integration.
 */
export function Location({
  eyebrow = "Lokasi",
  title = "Kunjungi Masjid Kami",
  subtitle = "Kami senang menyambut Anda untuk beribadah dan bersilaturahmi langsung di Masjid Baitul Hikmah Gondolayu Lor.",
  mosqueName = "Masjid Baitul Hikmah Gondolayu Lor",
  details = DEFAULT_DETAILS,
  mapEmbedSrc,
  googleMapsHref = "https://www.google.com/maps/search/?api=1&query=Masjid+Baitul+Hikmah+Gondolayu+Lor+Yogyakarta",
  directionsHref = "https://www.google.com/maps/dir/?api=1&destination=Masjid+Baitul+Hikmah+Gondolayu+Lor+Yogyakarta",
  id = "lokasi",
  className,
}: LocationProps) {
  return (
    <Section id={id} spacing="md" className={className}>
      <Container>
        <Stack gap="lg">
          <SectionHeader eyebrow={eyebrow} title={title} description={subtitle} level="h2" />

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeRight}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted"
            >
              {mapEmbedSrc ? (
                <iframe
                  src={mapEmbedSrc}
                  title={`Peta lokasi ${mosqueName}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 size-full border-0"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="size-8" aria-hidden />
                  <span className="text-small">Peta interaktif akan segera hadir</span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren(0.08)}
            >
              <Stack gap="lg">
                <motion.h3 variants={fadeUp} className="text-h3 font-heading text-heading">
                  {mosqueName}
                </motion.h3>

                <motion.div variants={fadeUp}>
                  <Stack gap="md">
                    {details.map((detail) => {
                      const Icon = DETAIL_ICON_BY_LABEL[detail.label] ?? MapPin;
                      return (
                        <div key={detail.label} className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="size-4" aria-hidden />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-label text-muted-foreground">{detail.label}</span>
                            <span className="text-body text-text">{detail.value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </Stack>
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
                  <a
                    href={googleMapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                  >
                    Buka di Google Maps
                  </a>
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex items-center gap-2")}
                  >
                    <Navigation className="size-4" aria-hidden />
                    Petunjuk Arah
                  </a>
                </motion.div>
              </Stack>
            </motion.div>
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
