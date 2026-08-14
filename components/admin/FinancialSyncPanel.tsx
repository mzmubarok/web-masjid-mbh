import type { FinancialSyncRun } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/Badge";
import { getFinancialSyncEnvStatus } from "@/lib/finance/env-status";

export interface FinancialSyncPanelProps {
  latestRun: FinancialSyncRun | null;
  history: FinancialSyncRun[];
}

/** A short, plain-language read of the latest run — what the badge/counts below mean at a glance. */
function statusSummary(run: FinancialSyncRun): string {
  if (run.status === "running") return "A sync is currently running.";
  if (run.status === "error") return "The last sync failed — see the reason below.";
  return run.skipped > 0
    ? `The last sync completed, but skipped ${run.skipped} row${run.skipped === 1 ? "" : "s"}.`
    : "The last sync completed successfully.";
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });
const timeFormatter = new Intl.DateTimeFormat("id-ID", { timeStyle: "short", timeZone: "Asia/Jakarta", hour12: false });

function statusTone(status: string): "success" | "destructive" | "warning" {
  if (status === "success") return "success";
  if (status === "error") return "destructive";
  return "warning";
}

function statusLabel(status: string): string {
  if (status === "success") return "Success";
  if (status === "error") return "Failed";
  return "Running";
}

/** A run's wall-clock duration, or `null` while still running (no `finishedAt` yet). */
function formatDuration(run: FinancialSyncRun): string | null {
  if (!run.finishedAt) return null;
  const seconds = (run.finishedAt.getTime() - run.startedAt.getTime()) / 1000;
  return `${seconds.toFixed(1)}s`;
}

/**
 * "Last Sync" status summary plus a short history table — the visibility
 * Phase 4 adds on top of the existing sync infrastructure (see
 * lib/finance/sync-monitoring.ts). Read-only; the "Sync from Spreadsheet"
 * button that actually triggers a run lives separately in
 * SyncFinancialReportsButton.tsx.
 */
export function FinancialSyncPanel({ latestRun, history }: FinancialSyncPanelProps) {
  const envStatus = getFinancialSyncEnvStatus();
  const envIssues = [
    !envStatus.csvUrlConfigured && "the spreadsheet connection",
    !envStatus.cronSecretConfigured && "automatic daily sync",
  ].filter((issue): issue is string => Boolean(issue));

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      {envIssues.length > 0 ? (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-small text-heading">
          Not fully set up yet: {envIssues.join(" and ")} still {envIssues.length > 1 ? "need" : "needs"} a developer
          to configure {envIssues.length > 1 ? "them" : "it"}.
        </div>
      ) : null}

      <div>
        <h3 className="text-h4 font-heading text-heading">Spreadsheet Sync</h3>

        {!latestRun ? (
          <p className="mt-2 text-small text-muted-foreground">No sync has run yet.</p>
        ) : (
          <>
            <p className="mt-2 text-small text-foreground">{statusSummary(latestRun)}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div>
                <dt className="text-caption text-muted-foreground">Last Sync</dt>
                <dd className="text-small text-foreground">
                  {dateFormatter.format(latestRun.startedAt)}
                  <br />
                  {timeFormatter.format(latestRun.startedAt)} WIB
                </dd>
              </div>
              <div>
                <dt className="text-caption text-muted-foreground">Status</dt>
                <dd>
                  <Badge tone={statusTone(latestRun.status)}>{statusLabel(latestRun.status)}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-caption text-muted-foreground">Created</dt>
                <dd className="text-small tabular-nums text-foreground">{latestRun.created}</dd>
              </div>
              <div>
                <dt className="text-caption text-muted-foreground">Updated</dt>
                <dd className="text-small tabular-nums text-foreground">{latestRun.updated}</dd>
              </div>
              <div>
                <dt className="text-caption text-muted-foreground">Skipped Rows</dt>
                <dd className="text-small tabular-nums text-foreground">{latestRun.skipped}</dd>
              </div>
              {latestRun.status === "error" && latestRun.errorMessage ? (
                <div className="col-span-2 sm:col-span-5">
                  <dt className="text-caption text-muted-foreground">Why it failed</dt>
                  <dd className="text-small text-destructive">{latestRun.errorMessage}</dd>
                </div>
              ) : null}
            </dl>
          </>
        )}
      </div>

      {history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-small">
            <thead className="border-b border-border text-caption text-muted-foreground">
              <tr>
                <th scope="col" className="px-2 py-2 font-medium">When</th>
                <th scope="col" className="px-2 py-2 font-medium">Trigger</th>
                <th scope="col" className="px-2 py-2 font-medium">Status</th>
                <th scope="col" className="px-2 py-2 font-medium">Created</th>
                <th scope="col" className="px-2 py-2 font-medium">Updated</th>
                <th scope="col" className="px-2 py-2 font-medium">Skipped</th>
                <th scope="col" className="px-2 py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {history.map((run) => (
                <tr key={run.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-2 text-muted-foreground">
                    {dateFormatter.format(run.startedAt)} {timeFormatter.format(run.startedAt)}
                  </td>
                  <td className="px-2 py-2 capitalize text-muted-foreground">{run.triggeredBy}</td>
                  <td className="px-2 py-2">
                    <Badge tone={statusTone(run.status)} size="sm">
                      {statusLabel(run.status)}
                    </Badge>
                  </td>
                  <td className="px-2 py-2 tabular-nums text-muted-foreground">{run.created}</td>
                  <td className="px-2 py-2 tabular-nums text-muted-foreground">{run.updated}</td>
                  <td className="px-2 py-2 tabular-nums text-muted-foreground">{run.skipped}</td>
                  <td className="px-2 py-2 tabular-nums text-muted-foreground">{formatDuration(run) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
