"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";

import { updateMediaMetadata } from "@/app/admin/media/action";
import type { Media } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export interface MediaMetadataFormProps {
  media: Media;
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}

/** Labeled form row — every input in this form goes through this so the label/id pairing is never missed. */
function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-label text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-caption text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const fileSizeFormatter = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;

const initialState = { status: "idle", message: "" } as const;

/** Editable metadata only — storage/identity fields (id, storedFileName, mimeType, fileSize, checksum, storagePath, uploadedById) are read-only here. */
export function MediaMetadataForm({ media }: MediaMetadataFormProps) {
  const [state, formAction, isPending] = useActionState(updateMediaMetadata, initialState);
  const isSvg = media.mimeType === "image/svg+xml";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Storage information — read-only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted">
            {isSvg ? (
              // next/image can't reliably size an unstyled SVG without an
              // intrinsic viewBox-derived width/height; a plain <img> here
              // avoids a broken/empty preview for this one format.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.storagePath} alt={media.altText ?? media.fileName} className="size-full object-contain" />
            ) : (
              <Image src={media.storagePath} alt={media.altText ?? media.fileName} fill className="object-contain" />
            )}
          </div>

          <dl className="space-y-1 text-caption text-muted-foreground">
            <div className="flex justify-between gap-2">
              <dt>File name</dt>
              <dd className="truncate text-foreground">{media.fileName}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Type</dt>
              <dd className="text-foreground">{media.mimeType}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Size</dt>
              <dd className="text-foreground">{fileSizeFormatter(media.fileSize)}</dd>
            </div>
            {media.width && media.height ? (
              <div className="flex justify-between gap-2">
                <dt>Dimensions</dt>
                <dd className="text-foreground">
                  {media.width} × {media.height}
                </dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Media Details</CardTitle>
            <CardDescription>Editable metadata. The stored file itself can&apos;t be changed here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="hidden" name="id" value={media.id} />

            <Field label="Title" htmlFor="title">
              <Input id="title" name="title" defaultValue={media.title ?? ""} />
            </Field>

            <Field label="Alt Text" htmlFor="altText" hint="Describes the image for accessibility and SEO.">
              <Input id="altText" name="altText" defaultValue={media.altText ?? ""} />
            </Field>

            <Field label="Description" htmlFor="description">
              <Textarea id="description" name="description" defaultValue={media.description ?? ""} />
            </Field>

            <Field label="Folder" htmlFor="folder" hint="A plain label for grouping, e.g. “events” or “hero”.">
              <Input id="folder" name="folder" defaultValue={media.folder ?? ""} />
            </Field>

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
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
