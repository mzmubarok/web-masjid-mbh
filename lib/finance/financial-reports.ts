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

/**
 * One card's worth of data per active, homepage-visible fund — each paired
 * with its own most recent published report. Ordered the same way
 * `getFinancialPrograms` already orders programs (displayOrder, then name).
 * A program with no published report yet is left out entirely; there's no
 * honest "empty" figure to show for it.
 */
export async function getHomepageFinancialSummaries() {
  const programs = await prisma.financialProgram.findMany({
    where: { isActive: true, showOnHomepage: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      reports: {
        where: { isPublished: true },
        orderBy: [{ reportYear: "desc" }, { reportMonth: "desc" }],
        take: 1,
      },
    },
  });

  return programs
    .filter((program) => program.reports.length > 0)
    .map((program) => ({ program, report: program.reports[0] }));
}
