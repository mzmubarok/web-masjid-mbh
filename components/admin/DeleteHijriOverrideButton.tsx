"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";

import { deleteHijriOverride } from "@/app/admin/settings/hijri/action";
import { Button } from "@/components/ui/Button";

export interface DeleteHijriOverrideButtonProps {
  id: string;
  /** Pre-formatted label for the confirmation prompt — e.g. "13 August 2026". */
  label: string;
}

const initialState = { status: "idle", message: "" } as const;

/** Delete action for one override row — confirms first, then reports why if the server refuses. */
export function DeleteHijriOverrideButton({ id, label }: DeleteHijriOverrideButtonProps) {
  const [state, formAction, isPending] = useActionState(deleteHijriOverride, initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete the override for ${label}? This can't be undone.`)) {
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
