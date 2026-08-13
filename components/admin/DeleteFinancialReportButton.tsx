"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";

import { deleteFinancialReport } from "@/app/admin/finance/reports/action";
import { Button } from "@/components/ui/Button";

export interface DeleteFinancialReportButtonProps {
  id: string;
  label: string;
}

const initialState = { status: "idle", message: "" } as const;

/** Delete action for one report row — confirms first, then reports why if the server refuses. */
export function DeleteFinancialReportButton({ id, label }: DeleteFinancialReportButtonProps) {
  const [state, formAction, isPending] = useActionState(deleteFinancialReport, initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete the "${label}" report? This can't be undone.`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="inline-flex flex-col items-start gap-1">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" size="sm" loading={isPending} className="text-destructive">
        Delete
      </Button>
      {state.status === "error" ? (
        <p role="alert" className="text-caption text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
