"use client";

import Image from "next/image";
import { useActionState } from "react";
import type { FormEvent } from "react";

import { updateGalleryPhoto, removeGalleryPhoto, reorderGalleryPhoto } from "@/app/admin/gallery/action";
import type { GalleryPhoto, Media } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface GalleryPhotoRowProps {
  photo: GalleryPhoto & { media: Media };
  isFirst: boolean;
  isLast: boolean;
}

const initialState = { status: "idle", message: "" } as const;

/** One photo in an album's photo list: edit caption/alt text/sort order, reorder, or remove. Never touches the underlying Media record. */
export function GalleryPhotoRow({ photo, isFirst, isLast }: GalleryPhotoRowProps) {
  const [updateState, updateAction, isUpdating] = useActionState(updateGalleryPhoto, initialState);
  const [removeState, removeAction, isRemoving] = useActionState(removeGalleryPhoto, initialState);
  const isSvg = photo.media.mimeType === "image/svg+xml";

  function handleRemoveSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Remove this photo from the album? The original file stays in the Media Library.")) {
      event.preventDefault();
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted">
        {isSvg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.media.storagePath}
            alt={photo.altText ?? photo.media.fileName}
            className="size-full object-contain p-1"
          />
        ) : (
          <Image
            src={photo.media.storagePath}
            alt={photo.altText ?? photo.media.fileName}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex-1 space-y-3">
        <p className="truncate text-caption text-muted-foreground" title={photo.media.fileName}>
          {photo.media.fileName}
        </p>

        <form action={updateAction} className="space-y-3">
          <input type="hidden" name="id" value={photo.id} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`caption-${photo.id}`} className="text-label text-foreground">Caption</label>
              <Input id={`caption-${photo.id}`} name="caption" defaultValue={photo.caption ?? ""} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`altText-${photo.id}`} className="text-label text-foreground">Alt Text</label>
              <Input id={`altText-${photo.id}`} name="altText" defaultValue={photo.altText ?? ""} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`sortOrder-${photo.id}`} className="text-label text-foreground">Sort Order</label>
              <Input
                id={`sortOrder-${photo.id}`}
                name="sortOrder"
                type="number"
                step={1}
                required
                defaultValue={photo.sortOrder}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" variant="outline" size="sm" loading={isUpdating}>
              Save
            </Button>
            {updateState.status === "error" ? (
              <p role="alert" className="text-caption text-destructive">
                {updateState.message}
              </p>
            ) : null}
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <form action={reorderGalleryPhoto.bind(null, photo.id, "up")}>
            <Button type="submit" variant="outline" size="sm" disabled={isFirst}>
              Move Up
            </Button>
          </form>

          <form action={reorderGalleryPhoto.bind(null, photo.id, "down")}>
            <Button type="submit" variant="outline" size="sm" disabled={isLast}>
              Move Down
            </Button>
          </form>

          <form action={removeAction} onSubmit={handleRemoveSubmit}>
            <input type="hidden" name="id" value={photo.id} />
            <Button type="submit" variant="outline" size="sm" loading={isRemoving} className="text-destructive">
              Remove
            </Button>
          </form>
        </div>

        {removeState.status === "error" ? (
          <p role="alert" className="text-caption text-destructive">
            {removeState.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
