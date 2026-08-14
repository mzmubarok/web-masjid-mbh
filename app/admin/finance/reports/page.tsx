import Link from "next/link";

import { getFinancialReports } from "@/lib/finance/financial-reports";
import { getLatestFinancialSyncRun, getFinancialSyncHistory } from "@/lib/finance/sync-monitoring";
import { toggleFinancialReportPublished } from "@/app/admin/finance/reports/action";
import { DeleteFinancialReportButton } from "@/components/admin/DeleteFinancialReportButton";
import { SyncFinancialReportsButton } from "@/components/admin/SyncFinancialReportsButton";
import { FinancialSyncPanel } from "@/components/admin/FinancialSyncPanel";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const currencyFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function FinancialReportsPage() {
  const [reports, latestSyncRun, syncHistory] = await Promise.all([
    getFinancialReports(),
    getLatestFinancialSyncRun(),
    getFinancialSyncHistory(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-heading">
            Financial Reports
          </h2>

          <p className="mt-2 text-body text-muted-foreground">
            Kelola laporan keuangan bulanan untuk setiap program.
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <Link href="/admin/finance" className={cn(buttonVariants({ variant: "outline" }))}>
            Financial Programs
          </Link>
          <SyncFinancialReportsButton />
          <Link href="/admin/finance/reports/new" className={cn(buttonVariants({ variant: "primary" }))}>
            Create Report
          </Link>
        </div>
      </div>

      <FinancialSyncPanel latestRun={latestSyncRun} history={syncHistory} />

      <div className="rounded-lg border border-border bg-card">
        {reports.length === 0 ? (
          <p className="p-6 text-small text-muted-foreground">
            No financial reports yet — create the first one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Program</th>
                  <th scope="col" className="px-4 py-3 font-medium">Period</th>
                  <th scope="col" className="px-4 py-3 font-medium">Current Balance</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const period = `${MONTH_NAMES[report.reportMonth - 1]} ${report.reportYear}`;

                  return (
                    <tr key={report.id} className="border-b border-border last:border-0 align-top">
                      <td className="px-4 py-3 font-medium text-foreground">{report.program.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{period}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {currencyFormatter.format(report.currentBalance.toNumber())}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={report.isPublished ? "success" : "outline"}>
                          {report.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/finance/reports/${report.id}/edit`}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                          >
                            Edit
                          </Link>

                          <form action={toggleFinancialReportPublished.bind(null, report.id, !report.isPublished)}>
                            <Button type="submit" variant="outline" size="sm">
                              {report.isPublished ? "Unpublish" : "Publish"}
                            </Button>
                          </form>

                          <DeleteFinancialReportButton id={report.id} label={`${report.program.name} — ${period}`} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
