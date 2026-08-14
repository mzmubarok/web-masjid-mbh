"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";

import { deleteEvent } from "@/app/admin/events/action";
import { Button } from "@/components/ui/Button";

export interface DeleteEventButtonProps {
  id: string;
  title: string;
}

const initialState = { status: "idle", message: "" } as const;

/** Delete action for one event row — confirms first, then reports why if the server refuses (e.g. still linked to a gallery album). */
export function DeleteEventButton({ id, title }: DeleteEventButtonProps) {
  const [state, formAction, isPending] = useActionState(deleteEvent, initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete the "${title}" event? This can't be undone.`)) {
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
