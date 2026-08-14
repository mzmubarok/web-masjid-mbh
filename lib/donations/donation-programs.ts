import { prisma } from "@/lib/prisma";

/** All donation programs with their cover image, sorted for display: displayOrder first, name as a stable tie-breaker. */
export async function getDonationPrograms() {
  return prisma.donationProgram.findMany({
    include: { coverImage: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

export async function getDonationProgramById(id: string) {
  return prisma.donationProgram.findUnique({ where: { id } });
}

/**
 * The single published donation program to feature on the public homepage's
 * Infaq banner — `isFeatured` preferred, then the same displayOrder/name
 * ordering `getDonationPrograms` already uses. `null` when no program is
 * published yet.
 */
export async function getFeaturedDonationProgram() {
  return prisma.donationProgram.findFirst({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { name: "asc" }],
  });
}
