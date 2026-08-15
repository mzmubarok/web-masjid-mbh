import type { PrismaClient } from "@/lib/generated/prisma/client";
import { LFNU_PARAMETERS } from "@/lib/prayer/prayer-parameters";

// PrayerSetting has no fixed known id (unlike SiteSetting's "site-settings")
// — `updatePrayerSettings` itself treats "does a row exist yet" as the
// singleton check via `findFirst()`, so the seed follows the same
// convention instead of upserting by id.
export async function seedPrayerSetting(prisma: PrismaClient) {
  console.log("🌱 Seeding prayer settings...");

  const existing = await prisma.prayerSetting.findFirst();
  if (existing) {
    console.log("✅ Prayer settings already exist, skipping.");
    return;
  }

  await prisma.prayerSetting.create({
    data: {
      mosqueName: "Masjid Baitul Hikmah Gondolayu Lor",
      latitude: "-7.7816445150184785",
      longitude: "110.3703836",
      timezone: "Asia/Jakarta",
      calculationMethod: "Ministry of Religious Affairs Indonesia",
      calculationMode: "LFNU",
      madhab: LFNU_PARAMETERS.madhab,
      isAutomatic: true,
      fajrAngle: LFNU_PARAMETERS.fajrAngle,
      ishaAngle: LFNU_PARAMETERS.ishaAngle,
      // No adjustment out of the box — an admin dials these in per prayer
      // from the CMS; the schema itself already defaults every one to 0.
      fajrIhtiyath: 0,
      sunriseIhtiyath: 0,
      dhuhrIhtiyath: 0,
      asrIhtiyath: 0,
      maghribIhtiyath: 0,
      ishaIhtiyath: 0,
    },
  });

  console.log("✅ Prayer settings seeded.");
}
