"use client";

import { useActionState } from "react";

import { syncFinancialReportsFromSheetAction } from "@/app/admin/finance/reports/action";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const initialState = { status: "idle", message: "" } as const;

/** Triggers the same spreadsheet import a future scheduled sync will use — see lib/finance/sheet-sync.ts. */
export function SyncFinancialReportsButton() {
  const [state, formAction, isPending] = useActionState(syncFinancialReportsFromSheetAction, initialState);

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1">
      <Button type="submit" variant="outline" loading={isPending}>
        Sync from Spreadsheet
      </Button>
      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={cn("text-caption", state.status === "error" ? "text-destructive" : "text-success")}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
