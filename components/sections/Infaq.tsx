"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, ShieldCheck, Zap } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Stack } from "@/components/layout/Stack";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { buttonVariants } from "@/components/ui/Button";
import { DonationModal } from "@/components/features";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface TrustIndicator {
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const DEFAULT_TRUST_INDICATORS: TrustIndicator[] = [
  { label: "Transparan", icon: Eye },
  { label: "Aman", icon: ShieldCheck },
  { label: "Mudah", icon: Zap },
];

export interface InfaqProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  trustIndicators?: TrustIndicator[];
  /** No `href` — clicking it opens the donation modal in place, it never navigates. */
  primaryCta?: { label: string };
  secondaryCta?: { label: string; href: string };
  /** Bank transfer details shown inside the donation modal — from SiteSetting, same source Footer/admin already read. All optional; the modal shows a graceful fallback if none are configured yet. */
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  /** Anchor id — Navbar's "Infaq" link points to `#infaq` by default. */
  id?: string;
  className?: string;
}

/**
 * Infaq call-to-action banner — one of the homepage's strongest CTAs. No
 * payment gateway here by design; the primary CTA opens `DonationModal`
 * (QRIS + bank transfer only) in place, and the secondary CTA is a plain
 * link out to a dedicated donation-programs page. Every piece of copy is a
 * prop with a placeholder default, ready for a CMS to override later.
 *
 * Runs on a Brand Gold background (via `className` override on `Section`
 * rather than a new background variant — `Section` itself stays untouched).
 * Every text/icon color here is a dark, full-opacity token (`text-heading`,
 * `text-accent-foreground`, `text-primary`) deliberately chosen over
 * `SectionHeader`'s `inverted` tone or any reduced-opacity treatment, both
 * of which are tuned for dark bands and fail WCAG contrast against gold.
 */
export function Infaq({
  eyebrow = "Infaq",
  title = "Infaq Pembangunan Masjid",
  subtitle = "Setiap infaq yang Anda salurkan menjadi bagian nyata dari pembangunan dan perawatan masjid — diamanahkan secara transparan untuk kenyamanan ibadah warga Gondolayu Lor, kini dan di masa mendatang.",
  trustIndicators = DEFAULT_TRUST_INDICATORS,
  primaryCta = { label: "Salurkan Infaq" },
  secondaryCta = { label: "Pelajari Program Infaq", href: "/program-donasi" },
  bankName,
  bankAccountName,
  bankAccountNumber,
  id = "infaq",
  className,
}: InfaqProps) {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  return (
    // "md" spacing — matches the rest of the homepage's rhythm; only the
    // Section's own external py-* changes here, nothing inside (heading,
    // buttons, icons) is resized.
    <Section id={id} spacing="md" className={cn("bg-accent text-accent-foreground", className)}>
      <Container size="content">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren(0.08)}
        >
          <Stack gap="lg" align="center">
            <motion.div variants={fadeUp}>
              {/* No `tone` prop — the default tone's dark tokens (heading,
                  primary, text) are already safe against this gold
                  background; `inverted` is tuned for dark bands and would
                  fail contrast here. */}
              <SectionHeader
                align="center"
                level="h2"
                eyebrow={eyebrow}
                title={title}
                description={subtitle}
              />
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-8">
              {trustIndicators.map((indicator) => (
                <div key={indicator.label} className="flex items-center gap-2">
                  <indicator.icon className="size-5 text-primary" aria-hidden />
                  <span className="text-small font-medium text-accent-foreground">
                    {indicator.label}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setIsDonationModalOpen(true)}
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
              >
                {primaryCta.label}
              </button>
              <Link
                href={secondaryCta.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10"
                )}
              >
                {secondaryCta.label}
              </Link>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>

      <DonationModal
        open={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        bankName={bankName}
        bankAccountName={bankAccountName}
        bankAccountNumber={bankAccountNumber}
      />
    </Section>
  );
}
