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
