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
