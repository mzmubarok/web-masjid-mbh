import type { PrismaClient } from "@/lib/generated/prisma/client";

export async function seedSiteSetting(prisma: PrismaClient) {
  console.log("🌱 Seeding site settings...");

  await prisma.siteSetting.upsert({
    where: {
      id: "site-settings",
    },
    update: {},
    create: {
      id: "site-settings",

      // General
      siteName: "Masjid",
      siteTagline: "Pusat Ibadah dan Kegiatan Umat",
      siteDescription:
        "Website resmi masjid sebagai pusat informasi, ibadah, dan kegiatan masyarakat.",
      language: "id",
      timezone: "Asia/Jakarta",

      // SEO
      metaTitle: "Masjid",
      metaDescription:
        "Website resmi masjid untuk informasi kegiatan, layanan, dan program masjid.",
      metaKeywords: "masjid, kegiatan masjid, informasi masjid",
      canonicalUrl: null,

      // Social Preview
      ogTitle: "Masjid",
      ogDescription:
        "Website resmi masjid untuk informasi kegiatan dan program masjid.",
      twitterCard: "summary_large_image",

      // Website Status
      maintenanceMode: false,
      maintenanceMessage: null,

      // Footer
      copyrightText: "© 2026 Masjid. All rights reserved.",
      footerDescription:
        "Pusat informasi dan kegiatan resmi masjid.",

      // Donation / Banking
      bankName: null,
      bankAccountName: null,
      bankAccountNumber: null,
      qrisImageId: null,
    },
  });

  console.log("✅ Site settings seeded.");
}