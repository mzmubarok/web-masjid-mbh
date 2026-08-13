"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";

import { deleteFinancialProgram } from "@/app/admin/finance/action";
import { Button } from "@/components/ui/Button";

export interface DeleteFinancialProgramButtonProps {
  id: string;
  name: string;
}

const initialState = { status: "idle", message: "" } as const;

/** Delete action for one program row — confirms first, then reports why if the server refuses (e.g. still in use by reports). */
export function DeleteFinancialProgramButton({ id, name }: DeleteFinancialProgramButtonProps) {
  const [state, formAction, isPending] = useActionState(deleteFinancialProgram, initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete the "${name}" financial program? This can't be undone.`)) {
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
