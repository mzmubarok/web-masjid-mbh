"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { updateAbout } from "@/app/admin/about/action";
import type { About } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export interface AboutFormProps {
  about: About | null;
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

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

const initialState = { status: "idle", message: "" } as const;

export function AboutForm({ about }: AboutFormProps) {
  const [state, formAction, isPending] = useActionState(updateAbout, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={about?.id ?? ""} />

      <Card>
        <CardHeader>
          <CardTitle>About Content</CardTitle>
          <CardDescription>
            The mosque introduction shown in the homepage About section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Title"
            htmlFor="title"
            required
            hint="Press Enter for a manual line break — the public About section renders it exactly as entered."
          >
            <Textarea id="title" name="title" required rows={3} defaultValue={about?.title ?? ""} />
          </Field>

          <Field label="Introduction" htmlFor="introduction" required>
            <Textarea
              id="introduction"
              name="introduction"
              required
              defaultValue={about?.introduction ?? ""}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History, Vision &amp; Mission</CardTitle>
          <CardDescription>Shown alongside the introduction and on the dedicated About page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="History" htmlFor="history" required>
            <Textarea id="history" name="history" required defaultValue={about?.history ?? ""} />
          </Field>

          <Field label="Vision" htmlFor="vision" required>
            <Textarea id="vision" name="vision" required defaultValue={about?.vision ?? ""} />
          </Field>

          <Field label="Mission" htmlFor="mission" required>
            <Textarea id="mission" name="mission" required defaultValue={about?.mission ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Page</CardTitle>
          <CardDescription>Full, long-form content for the dedicated About page (optional).</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="About Page Content" htmlFor="aboutPageContent">
            <Textarea
              id="aboutPageContent"
              name="aboutPageContent"
              className="min-h-56"
              defaultValue={about?.aboutPageContent ?? ""}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
          <CardDescription>Only the published About record is shown on the public website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              defaultChecked={about?.isPublished ?? false}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="isPublished" className="text-label text-foreground">
              Publish this About section
            </label>
          </div>

          {about ? (
            <p className="text-caption text-muted-foreground">
              Last updated {dateFormatter.format(about.updatedAt)}
              {about.publishedAt ? ` · Published ${dateFormatter.format(about.publishedAt)}` : " · Not published"}
            </p>
          ) : (
            <p className="text-caption text-muted-foreground">
              No About content has been created yet — saving this form will create it.
            </p>
          )}
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
          Save Changes
        </Button>
      </div>
    </form>
  );
}
