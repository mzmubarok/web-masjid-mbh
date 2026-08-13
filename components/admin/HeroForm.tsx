"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { updateHero } from "@/app/admin/hero/action";
import type { Hero } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export interface HeroFormProps {
  hero: Hero | null;
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

export function HeroForm({ hero }: HeroFormProps) {
  const [state, formAction, isPending] = useActionState(updateHero, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={hero?.id ?? ""} />

      <Card>
        <CardHeader>
          <CardTitle>Hero Content</CardTitle>
          <CardDescription>
            The headline and supporting text shown in the homepage Hero section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Title"
            htmlFor="title"
            required
            hint="Press Enter for a manual line break — the public Hero renders it exactly as entered."
          >
            <Textarea id="title" name="title" required rows={3} defaultValue={hero?.title ?? ""} />
          </Field>

          <Field label="Subtitle" htmlFor="subtitle">
            <Textarea id="subtitle" name="subtitle" defaultValue={hero?.subtitle ?? ""} />
          </Field>

          <Field
            label="Background Image ID"
            htmlFor="backgroundImageId"
            hint="Paste the ID of an existing Media item. There is no media picker yet — the Media Library hasn't been built."
          >
            <Input
              id="backgroundImageId"
              name="backgroundImageId"
              autoComplete="off"
              defaultValue={hero?.backgroundImageId ?? ""}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
          <CardDescription>Only the published Hero is shown on the public homepage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              defaultChecked={hero?.isPublished ?? false}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="isPublished" className="text-label text-foreground">
              Publish this Hero section
            </label>
          </div>

          {hero ? (
            <p className="text-caption text-muted-foreground">
              Last updated {dateFormatter.format(hero.updatedAt)}
              {hero.publishedAt ? ` · Published ${dateFormatter.format(hero.publishedAt)}` : " · Not published"}
            </p>
          ) : (
            <p className="text-caption text-muted-foreground">
              No Hero content has been created yet — saving this form will create it.
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
