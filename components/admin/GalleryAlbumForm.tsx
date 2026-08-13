"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { createGalleryAlbum, updateGalleryAlbum } from "@/app/admin/gallery/action";
import { toDateInputValue } from "@/lib/date";
import type { Event, GalleryAlbum, Media } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { cn } from "@/lib/utils";

export interface GalleryAlbumFormProps {
  /** Omit (or pass null) to render a "create new" form; pass an album to edit it in place. */
  album?: GalleryAlbum | null;
  events: Event[];
  media: Media[];
}

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

/** Labeled form row — every input in this form goes through this so the label/id pairing is never missed. */
function Field({ label, htmlFor, required, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-label text-foreground">
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="text-caption text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

// Matches Input's own styling — no Select component exists in components/ui,
// and a native <select> doesn't warrant adding one.
const selectClassName = cn(
  "h-11 w-full rounded-md border border-input bg-surface px-4 text-body text-foreground",
  "transition-colors duration-150",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-destructive"
);

// Events are stored as UTC midnight (see lib/date.ts) — format in UTC so the
// displayed date always matches what was picked, regardless of server timezone.
const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "UTC" });

const initialState = { status: "idle", message: "" } as const;

/** One form, reused for both creating and editing a GalleryAlbum. */
export function GalleryAlbumForm({ album = null, events, media }: GalleryAlbumFormProps) {
  const action = album ? updateGalleryAlbum : createGalleryAlbum;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {album ? <input type="hidden" name="id" value={album.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Album Details</CardTitle>
          <CardDescription>The core content shown on the album&apos;s card and page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" required defaultValue={album?.title ?? ""} />
          </Field>

          <Field label="Slug" htmlFor="slug" hint="Leave blank to generate one from the title.">
            <Input id="slug" name="slug" autoComplete="off" defaultValue={album?.slug ?? ""} />
          </Field>

          <Field label="Description" htmlFor="description" hint="Optional.">
            <Textarea id="description" name="description" defaultValue={album?.description ?? ""} />
          </Field>

          <Field label="Cover Image" htmlFor="coverImageId" hint="Optional — pick an existing Media item.">
            <MediaPicker name="coverImageId" media={media} defaultValue={album?.coverImageId ?? null} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Association</CardTitle>
          <CardDescription>Optionally link this album to an existing event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Event" htmlFor="eventId" hint="Optional.">
            <select
              id="eventId"
              name="eventId"
              defaultValue={album?.eventId ?? ""}
              className={selectClassName}
            >
              <option value="">No event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} ({dateFormatter.format(event.startDate)})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Event Date" htmlFor="eventDate" hint="Optional — independent of the linked event's own date.">
            <Input
              id="eventDate"
              name="eventDate"
              type="date"
              defaultValue={album?.eventDate ? toDateInputValue(album.eventDate) : ""}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>Only published albums are shown on the public website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Sort Order" htmlFor="sortOrder" required>
            <Input id="sortOrder" name="sortOrder" type="number" step={1} required defaultValue={album?.sortOrder ?? 0} />
          </Field>

          <div className="flex items-center gap-3">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              defaultChecked={album?.isPublished ?? false}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="isPublished" className="text-label text-foreground">
              Publish this album
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              defaultChecked={album?.isFeatured ?? false}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="isFeatured" className="text-label text-foreground">
              Feature this album on the homepage
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
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
          {album ? "Save Changes" : "Create Album"}
        </Button>
      </div>
    </form>
  );
}
