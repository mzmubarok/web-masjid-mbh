"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Clock3, Utensils, Wallet } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Stack } from "@/components/layout/Stack";
import { Grid } from "@/components/layout/Grid";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { buttonVariants } from "@/components/ui/Button";
import {
  FinancialSummaryCard,
  type FinancialSummaryCardTone,
  type FinancialSummaryFigure,
} from "@/components/features/finance/FinancialSummaryCard";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type FinancialSummaryItem = FinancialSummaryFigure;

export interface FinancialFund {
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  /** Tints this fund's icon circle so the three cards read as distinct at a glance. */
  tone: FinancialSummaryCardTone;
  /** Row 1 — label wording (e.g. "Total Dana" vs "Total Saldo") intentionally varies per fund. */
  primaryStat: FinancialSummaryItem;
  /** Row 2 — income, then expense, this month. */
  secondaryStats: [FinancialSummaryItem, FinancialSummaryItem];
  /** Row 3 — the fund's current/final balance, visually highlighted. */
  currentBalance: FinancialSummaryItem;
}

const DEFAULT_FUNDS: FinancialFund[] = [
  {
    name: "Infaq Operasional",
    description: "Menopang kebutuhan operasional masjid sehari-hari.",
    icon: Wallet,
    tone: "primary",
    primaryStat: { label: "Total Saldo", value: "Rp 45.200.000" },
    secondaryStats: [
      { label: "Pemasukan Bulan Ini", value: "Rp 12.500.000" },
      { label: "Pengeluaran Bulan Ini", value: "Rp 8.750.000" },
    ],
    currentBalance: { label: "Saldo Saat Ini", value: "Rp 48.950.000" },
  },
  {
    name: "Infaq Pembangunan Masjid",
    description: "Dikhususkan untuk pembangunan dan renovasi masjid.",
    icon: Building2,
    tone: "secondary",
    primaryStat: { label: "Total Dana", value: "Rp 310.000.000" },
    secondaryStats: [
      { label: "Pemasukan Bulan Ini", value: "Rp 25.000.000" },
      { label: "Pengeluaran Bulan Ini", value: "Rp 40.000.000" },
    ],
    currentBalance: { label: "Saldo Saat Ini", value: "Rp 295.000.000" },
  },
  {
    name: "S3 — Sehari Seribu Saja",
    description: "Mendukung kegiatan Ramadan, terutama penyediaan takjil harian.",
    icon: Utensils,
    tone: "accent",
    primaryStat: { label: "Total Dana", value: "Rp 18.600.000" },
    secondaryStats: [
      { label: "Pemasukan Bulan Ini", value: "Rp 4.200.000" },
      { label: "Pengeluaran Bulan Ini", value: "Rp 3.100.000" },
    ],
    currentBalance: { label: "Saldo Saat Ini", value: "Rp 19.700.000" },
  },
];

export interface FinancialProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** The three donation funds — a prop, so a backend/CMS can inject real per-fund figures later. */
  funds?: FinancialFund[];
  /** Pre-formatted, e.g. "1 Maret 2026" — placeholder until real report data exists. */
  lastUpdated?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Anchor id — Navbar's "Laporan Keuangan" link points to `#laporan-keuangan` by default. */
  id?: string;
  className?: string;
}

/**
 * Financial transparency summary — one dedicated card per donation fund
 * (Operasional / Pembangunan / S3), each with its own income, expense, and
 * balance figures, since the mosque tracks them as three independent
 * funds rather than one pooled total. "Last Updated" and the report CTA
 * stay global for the section, not repeated per card, since they describe
 * the report as a whole. Presentational only — `funds` and `lastUpdated`
 * are props with placeholder defaults, ready for a backend/CMS to inject
 * real per-fund figures later without any change to this component.
 */
export function Financial({
  eyebrow = "Transparansi",
  title = "Laporan Keuangan",
  subtitle = "Masjid Baitul Hikmah mengelola tiga dana infaq secara terpisah — setiap dana memiliki catatan pemasukan dan pengeluarannya sendiri.",
  funds = DEFAULT_FUNDS,
  lastUpdated = "1 Maret 2026",
  ctaLabel = "Lihat Laporan Lengkap",
  ctaHref = "/laporan-keuangan",
  id = "laporan-keuangan",
  className,
}: FinancialProps) {
  return (
    <Section id={id} background="muted" spacing="md" className={className}>
      <Container>
        <Stack gap="lg" align="center">
          <SectionHeader align="center" level="h2" eyebrow={eyebrow} title={title} description={subtitle} />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren(0.08)}
            className="w-full"
          >
            <Grid cols={3} gap="lg">
              {funds.map((fund) => (
                <motion.div key={fund.name} variants={fadeUp}>
                  <FinancialSummaryCard
                    title={fund.name}
                    description={fund.description}
                    icon={fund.icon}
                    tone={fund.tone}
                    primaryStat={fund.primaryStat}
                    secondaryStats={fund.secondaryStats}
                    currentBalance={fund.currentBalance}
                    className="h-full"
                  />
                </motion.div>
              ))}
            </Grid>
          </motion.div>

          <Stack gap="md" align="center">
            <span className="inline-flex items-center gap-2 text-caption text-muted-foreground">
              <Clock3 className="size-3.5" aria-hidden />
              Terakhir diperbarui: {lastUpdated}
            </span>
            <Link href={ctaHref} className={cn(buttonVariants({ variant: "outline", size: "md" }))}>
              {ctaLabel}
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
