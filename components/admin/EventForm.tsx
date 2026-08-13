"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { createEvent, updateEvent } from "@/app/admin/events/action";
import { toDateInputValue } from "@/lib/date";
import type { Event, EventCategory } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export interface EventFormProps {
  /** Omit (or pass null) to render a "create new" form; pass an event to edit it in place. */
  event?: Event | null;
  /** Selectable categories — active ones, plus the event's own category if it's since been deactivated. */
  categories: EventCategory[];
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

const initialState = { status: "idle", message: "" } as const;

/** One form, reused for both creating and editing an Event. */
export function EventForm({ event = null, categories }: EventFormProps) {
  const action = event ? updateEvent : createEvent;
  const [state, formAction, isPending] = useActionState(action, initialState);

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Categories</CardTitle>
          <CardDescription>Events need a category before one can be created.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-small text-muted-foreground">
            There are no active event categories yet.{" "}
            <a href="/admin/events/categories" className="text-primary underline underline-offset-4">
              Create one in Event Categories
            </a>{" "}
            first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>The core content shown on the event&apos;s page and cards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" required defaultValue={event?.title ?? ""} />
          </Field>

          <Field label="Slug" htmlFor="slug" hint="Leave blank to generate one from the title.">
            <Input id="slug" name="slug" autoComplete="off" defaultValue={event?.slug ?? ""} />
          </Field>

          <Field label="Excerpt" htmlFor="excerpt" required hint="Short summary shown on event cards.">
            <Textarea id="excerpt" name="excerpt" required defaultValue={event?.excerpt ?? ""} />
          </Field>

          <Field label="Description" htmlFor="description" required>
            <Textarea
              id="description"
              name="description"
              required
              className="min-h-40"
              defaultValue={event?.description ?? ""}
            />
          </Field>

          <Field label="Category" htmlFor="categoryId" required>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={event?.categoryId ?? ""}
              className={selectClassName}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {!category.isActive ? " (inactive)" : ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Location" htmlFor="location" required>
            <Input id="location" name="location" required defaultValue={event?.location ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>When the event starts, and ends if it&apos;s multi-day or has a known end time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start Date" htmlFor="startDate" required>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                defaultValue={event ? toDateInputValue(event.startDate) : ""}
              />
            </Field>

            <Field label="Start Time" htmlFor="startTime" required>
              <Input id="startTime" name="startTime" type="time" required defaultValue={event?.startTime ?? ""} />
            </Field>

            <Field label="End Date" htmlFor="endDate" hint="Optional — for multi-day events.">
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={event?.endDate ? toDateInputValue(event.endDate) : ""}
              />
            </Field>

            <Field label="End Time" htmlFor="endTime" hint="Optional.">
              <Input id="endTime" name="endTime" type="time" defaultValue={event?.endTime ?? ""} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>Only published events are shown on the public website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              defaultChecked={event?.isPublished ?? false}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="isPublished" className="text-label text-foreground">
              Publish this event
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              defaultChecked={event?.isFeatured ?? false}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="isFeatured" className="text-label text-foreground">
              Feature this event on the homepage
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
          {event ? "Save Changes" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
