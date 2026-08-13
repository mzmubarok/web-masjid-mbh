import { prisma } from "@/lib/prisma";

/** The singleton PrayerSetting record — at most one should ever exist. Returns null until the settings form is saved for the first time. */
export async function getPrayerSettings() {
  return prisma.prayerSetting.findFirst();
}
