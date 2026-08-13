import { prisma } from "@/lib/prisma";

/** All Hijri overrides, most recent Gregorian date first. */
export async function getHijriOverrides() {
  return prisma.hijriOverride.findMany({
    orderBy: { gregorianDate: "desc" },
  });
}

export async function getHijriOverrideById(id: string) {
  return prisma.hijriOverride.findUnique({ where: { id } });
}

/**
 * The HijriOverride for one Gregorian calendar date, if one exists.
 * `gregorianDate` must already be normalized to UTC midnight (see
 * lib/date.ts's `parseDateOnly`) — the same convention every HijriOverride
 * is stored under.
 */
export async function getHijriOverrideForDate(gregorianDate: Date) {
  return prisma.hijriOverride.findUnique({ where: { gregorianDate } });
}
