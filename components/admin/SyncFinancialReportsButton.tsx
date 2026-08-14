"use client";

import { useActionState } from "react";

import { syncFinancialReportsFromSheetAction } from "@/app/admin/finance/reports/action";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const initialState = { status: "idle", message: "" } as const;

/** Triggers the same spreadsheet import the daily cron uses — see lib/finance/sync-monitoring.ts. */
export function SyncFinancialReportsButton() {
  const [state, formAction, isPending] = useActionState(syncFinancialReportsFromSheetAction, initialState);

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1">
      <Button type="submit" variant="outline" loading={isPending}>
        Sync from Spreadsheet
      </Button>

      {state.status === "success" ? (
        <div role="status" className="text-caption text-muted-foreground">
          <p className="text-foreground">Sync completed successfully.</p>
          <dl className="mt-1 grid grid-cols-[auto_auto] gap-x-2">
            <dt>Created</dt>
            <dd className="text-foreground">{state.created}</dd>
            <dt>Updated</dt>
            <dd className="text-foreground">{state.updated}</dd>
            <dt>Skipped</dt>
            <dd className="text-foreground">{state.skipped}</dd>
            {state.durationMs !== undefined ? (
              <>
                <dt>Duration</dt>
                <dd className="text-foreground">{(state.durationMs / 1000).toFixed(2)} seconds</dd>
              </>
            ) : null}
            {state.latestPeriod ? (
              <>
                <dt>Latest Report Period</dt>
                <dd className="text-foreground">{state.latestPeriod}</dd>
              </>
            ) : null}
          </dl>
          {/* Per-row skip reasons, beyond the count already shown above. */}
          {state.message ? <p className="mt-1">{state.message}</p> : null}
        </div>
      ) : null}

      {state.status === "error" ? (
        <p role="alert" className={cn("text-caption text-destructive")}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
