import { notFound } from "next/navigation";

import { getFinancialReportById } from "@/lib/finance/financial-reports";
import { getSelectablePrograms } from "@/lib/finance/financial-programs";
import { FinancialReportForm } from "@/components/admin/FinancialReportForm";

export default async function EditFinancialReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getFinancialReportById(id);

  if (!report) {
    notFound();
  }

  const programs = await getSelectablePrograms(report.programId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Edit Financial Report
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Perbarui detail laporan keuangan.
        </p>
      </div>

      <FinancialReportForm
        report={{
          ...report,
          // Decimal objects can't cross the Server -> Client Component
          // boundary as-is — serialize to plain strings first.
          totalFund: report.totalFund.toString(),
          monthlyIncome: report.monthlyIncome.toString(),
          monthlyExpense: report.monthlyExpense.toString(),
          currentBalance: report.currentBalance.toString(),
        }}
        programs={programs}
      />
    </div>
  );
}
