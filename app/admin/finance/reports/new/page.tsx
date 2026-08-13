import { getSelectablePrograms } from "@/lib/finance/financial-programs";
import { FinancialReportForm } from "@/components/admin/FinancialReportForm";

export default async function NewFinancialReportPage() {
  const programs = await getSelectablePrograms();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Create Financial Report
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Tambahkan laporan keuangan bulanan untuk sebuah program.
        </p>
      </div>

      <FinancialReportForm programs={programs} />
    </div>
  );
}
