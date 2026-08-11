"use client";

import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeartHandshake, Landmark, Sprout } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Stack } from "@/components/layout/Stack";
import { Grid } from "@/components/layout/Grid";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { fadeRight, fadeUp, staggerChildren } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface AboutFact {
  label: string;
  description: string;
}

export interface AboutValue {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

const DEFAULT_FACTS: AboutFact[] = [
  {
    label: "Sejarah",
    description: "Placeholder sejarah singkat berdirinya Masjid Baitul Hikmah bagi warga Gondolayu Lor.",
  },
  {
    label: "Visi",
    description: "Placeholder visi masjid sebagai pusat ibadah dan syiar Islam yang rahmatan lil alamin.",
  },
  {
    label: "Misi",
    description: "Placeholder misi menyelenggarakan ibadah, pendidikan, dan pelayanan umat secara berkelanjutan.",
  },
];

const DEFAULT_VALUES: AboutValue[] = [
  {
    title: "Mengaji",
    icon: Landmark,
    description: "Placeholder deskripsi singkat tentang kegiatan mengaji dan menimba ilmu di masjid.",
  },
  {
    title: "Mengabdi",
    icon: HeartHandshake,
    description: "Placeholder deskripsi singkat tentang pengabdian kepada jamaah dan masyarakat sekitar.",
  },
  {
    title: "Menghidupi",
    icon: Sprout,
    description: "Placeholder deskripsi singkat tentang menghidupi nilai-nilai Islam dalam keseharian.",
  },
];

export interface AboutProps {
  eyebrow?: string;
  title?: string;
  /** Short intro paragraph — the CMS field most likely to change often. */
  introduction?: ReactNode;
  /** History/Vision/Mission — a list rather than fixed fields, so a CMS can add/reorder entries freely. */
  facts?: AboutFact[];
  imageSrc?: string;
  imageAlt?: string;
  primaryCta?: { label: string; href: string };
  /** The three "Mengaji / Mengabdi / Menghidupi" value cards below. */
  values?: AboutValue[];
  /** Anchor id — Navbar's "Tentang" link points to `#tentang` by default. */
  id?: string;
  className?: string;
}

/**
 * About the mosque — two-column intro (photo + history/vision/mission) with
 * a three-value-card row beneath. Every piece of copy and the image are
 * props with placeholder defaults, so a CMS can replace them later without
 * touching this component.
 */
export function About({
  eyebrow = "Tentang Kami",
  title = "Masjid Baitul Hikmah Gondolayu Lor",
  introduction = "Placeholder pengantar singkat tentang Masjid Baitul Hikmah, perannya bagi warga Gondolayu Lor, dan semangat yang menghidupinya sehari-hari.",
  facts = DEFAULT_FACTS,
  // No dedicated About photo exists yet in /public/images/about/ — falls back
  // to the Hero photograph (the only real asset available) until one is added.
  imageSrc = "/images/hero/hero-masjid.webp",
  imageAlt = "Suasana Masjid Baitul Hikmah Gondolayu Lor",
  primaryCta = { label: "Tentang Masjid", href: "/tentang" },
  values = DEFAULT_VALUES,
  id = "tentang",
  className,
}: AboutProps) {
  // "md" — matches every other homepage section's vertical rhythm; this
  // used to be the one outlier at "lg", which is what made the gap before
  // Events read as noticeably bigger than the rest of the page.
  return (
    <Section id={id} spacing="md" className={className}>
      <Container>
        <Stack gap="lg">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeRight}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl"
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren(0.08)}
              className="lg:order-1"
            >
              <Stack gap="lg">
                <motion.div variants={fadeUp}>
                  <SectionHeader eyebrow={eyebrow} title={title} level="h2" />
                </motion.div>

                <motion.p variants={fadeUp} className="text-body-lg text-text">
                  {introduction}
                </motion.p>

                <motion.dl variants={fadeUp}>
                  <Stack gap="sm">
                    {facts.map((fact) => (
                      <div key={fact.label}>
                        <dt className="text-label text-primary">{fact.label}</dt>
                        <dd className="text-small text-muted-foreground">{fact.description}</dd>
                      </div>
                    ))}
                  </Stack>
                </motion.dl>

                <motion.div variants={fadeUp}>
                  <Link href={primaryCta.href} className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
                    {primaryCta.label}
                  </Link>
                </motion.div>
              </Stack>
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren(0.08)}
          >
            <Grid cols={3}>
              {values.map((value) => (
                <motion.div key={value.title} variants={fadeUp}>
                  <Card interactive className="group h-full">
                    <CardHeader>
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15">
                        <value.icon className="size-6 transition-transform duration-200 group-hover:scale-110" />
                      </div>
                      <CardTitle className="pt-2">{value.title}</CardTitle>
                      <CardDescription>{value.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </Grid>
          </motion.div>
        </Stack>
      </Container>
    </Section>
  );
}
