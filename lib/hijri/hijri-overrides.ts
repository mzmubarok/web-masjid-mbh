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
