"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";

import { deleteGalleryAlbum } from "@/app/admin/gallery/action";
import { Button } from "@/components/ui/Button";

export interface DeleteGalleryAlbumButtonProps {
  id: string;
  title: string;
  photoCount: number;
}

const initialState = { status: "idle", message: "" } as const;

/**
 * Delete action for one album row — confirms first (mentioning its photo
 * count, since deleting removes those GalleryPhoto rows too), then reports
 * why if the server refuses. The photos' underlying Media records are never
 * deleted — only the album's own GalleryPhoto rows are.
 */
export function DeleteGalleryAlbumButton({ id, title, photoCount }: DeleteGalleryAlbumButtonProps) {
  const [state, formAction, isPending] = useActionState(deleteGalleryAlbum, initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const photoNote =
      photoCount > 0
        ? ` This will also remove its ${photoCount} photo${photoCount === 1 ? "" : "s"} from the album (the original files stay in the Media Library).`
        : "";
    if (!window.confirm(`Delete the "${title}" album?${photoNote} This can't be undone.`)) {
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
