import { prisma } from "@/lib/prisma";

/** All financial programs with their icon, sorted for display: displayOrder first, name as a stable tie-breaker. */
export async function getFinancialPrograms() {
  return prisma.financialProgram.findMany({
    include: { icon: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

export async function getFinancialProgramById(id: string) {
  return prisma.financialProgram.findUnique({ where: { id } });
}

/**
 * Programs selectable in a Financial Report's program dropdown: active ones,
 * plus `currentProgramId` even if it's since been deactivated — so editing
 * an existing report never silently drops or reassigns its program just
 * because that program was deactivated after the fact.
 */
export async function getSelectablePrograms(currentProgramId?: string) {
  return prisma.financialProgram.findMany({
    where: currentProgramId
      ? { OR: [{ isActive: true }, { id: currentProgramId }] }
      : { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}
