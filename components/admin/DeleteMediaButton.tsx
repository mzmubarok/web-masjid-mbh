"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";

import { deleteMedia } from "@/app/admin/media/action";
import { Button } from "@/components/ui/Button";

export interface DeleteMediaButtonProps {
  id: string;
  fileName: string;
}

const initialState = { status: "idle", message: "" } as const;

/** Delete action for one media item — confirms first, then reports why if the server refuses (e.g. still in use). */
export function DeleteMediaButton({ id, fileName }: DeleteMediaButtonProps) {
  const [state, formAction, isPending] = useActionState(deleteMedia, initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete "${fileName}"? This can't be undone.`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col items-start gap-1">
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
