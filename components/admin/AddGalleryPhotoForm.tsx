"use client";

import { useActionState } from "react";

import { addGalleryPhoto } from "@/app/admin/gallery/action";
import type { Media } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { cn } from "@/lib/utils";

export interface AddGalleryPhotoFormProps {
  albumId: string;
  media: Media[];
}

const initialState = { status: "idle", message: "" } as const;

/** Adds an existing Media record to the album as a GalleryPhoto — never uploads or creates Media. */
export function AddGalleryPhotoForm({ albumId, media }: AddGalleryPhotoFormProps) {
  const [state, formAction, isPending] = useActionState(addGalleryPhoto, initialState);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Add Photo</CardTitle>
          <CardDescription>Add an existing Media Library item to this album.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="hidden" name="albumId" value={albumId} />

          <div className="flex flex-col gap-1.5">
            <label className="text-label text-foreground">
              Media <span className="text-destructive" aria-hidden> *</span>
            </label>
            <MediaPicker name="mediaId" media={media} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="caption" className="text-label text-foreground">Caption</label>
              <Input id="caption" name="caption" autoComplete="off" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="altText" className="text-label text-foreground">Alt Text</label>
              <Input id="altText" name="altText" autoComplete="off" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sortOrder" className="text-label text-foreground">Sort Order</label>
              <Input id="sortOrder" name="sortOrder" type="number" step={1} placeholder="Auto" />
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              role={state.status === "error" ? "alert" : "status"}
              aria-live="polite"
              className={cn(
                "text-small",
                state.status === "success" && "text-success",
                state.status === "error" && "text-destructive",
                state.status === "idle" && "sr-only"
              )}
            >
              {state.message}
            </div>

            <Button type="submit" loading={isPending} className="sm:ml-auto">
              Add Photo
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
