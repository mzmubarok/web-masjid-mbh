"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Stack } from "@/components/layout/Stack";
import { Grid } from "@/components/layout/Grid";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { FinancialStat } from "@/components/features/finance/FinancialStat";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface FinancialSummaryItem {
  label: string;
  /** Pre-formatted value, e.g. "Rp 125.750.000" — no currency logic here. */
  value: string;
}

const DEFAULT_SUMMARY: FinancialSummaryItem[] = [
  { label: "Total Kas", value: "Rp 125.750.000" },
  { label: "Pemasukan Bulan Ini", value: "Rp 18.400.000" },
  { label: "Pengeluaran Bulan Ini", value: "Rp 9.250.000" },
  { label: "Saldo Akhir", value: "Rp 134.900.000" },
];

export interface FinancialProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** The four summary figures — a prop, so a backend/CMS can inject real numbers later. */
  summary?: FinancialSummaryItem[];
  /** Pre-formatted, e.g. "1 Maret 2026" — placeholder until real report data exists. */
  lastUpdated?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Anchor id — Navbar's "Laporan Keuangan" link points to `#laporan-keuangan` by default. */
  id?: string;
  className?: string;
}

/**
 * Financial transparency summary. Presentational only — `summary` and
 * `lastUpdated` are props with placeholder defaults, so a backend/CMS can
 * inject real figures later without any change to this component.
 */
export function Financial({
  eyebrow = "Transparansi",
  title = "Laporan Keuangan",
  subtitle = "Transparansi adalah bagian dari amanah.",
  summary = DEFAULT_SUMMARY,
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
            variants={staggerChildren(0.06)}
            className="w-full"
          >
            <Grid cols={4}>
              {summary.map((item) => (
                <motion.div key={item.label} variants={fadeUp}>
                  <Card className="h-full">
                    <FinancialStat label={item.label} value={item.value} />
                  </Card>
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
