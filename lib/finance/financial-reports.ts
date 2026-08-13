import { prisma } from "@/lib/prisma";

/** All financial reports with their program, most recent period first. */
export async function getFinancialReports() {
  return prisma.financialReport.findMany({
    include: { program: true },
    orderBy: [{ reportYear: "desc" }, { reportMonth: "desc" }],
  });
}

export async function getFinancialReportById(id: string) {
  return prisma.financialReport.findUnique({ where: { id } });
}
