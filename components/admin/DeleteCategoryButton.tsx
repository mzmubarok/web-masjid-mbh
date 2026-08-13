"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";

import { deleteEventCategory } from "@/app/admin/events/categories/action";
import { Button } from "@/components/ui/Button";

export interface DeleteCategoryButtonProps {
  id: string;
  name: string;
}

const initialState = { status: "idle", message: "" } as const;

/** Delete action for one category row — confirms first, then reports why if the server refuses (e.g. still in use). */
export function DeleteCategoryButton({ id, name }: DeleteCategoryButtonProps) {
  const [state, formAction, isPending] = useActionState(deleteEventCategory, initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete the "${name}" category? This can't be undone.`)) {
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
