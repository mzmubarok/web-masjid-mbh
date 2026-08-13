"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { createDonationProgram, updateDonationProgram } from "@/app/admin/donations/action";
import type { DonationProgram, Media } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { cn } from "@/lib/utils";

export interface DonationProgramFormProps {
  /** Omit (or pass null) to render a "create new" form; pass a program to edit it in place. */
  program?: DonationProgram | null;
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

const initialState = { status: "idle", message: "" } as const;

/** One form, reused for both creating and editing a DonationProgram. */
export function DonationProgramForm({ program = null, media }: DonationProgramFormProps) {
  const action = program ? updateDonationProgram : createDonationProgram;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {program ? <input type="hidden" name="id" value={program.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
          <CardDescription>The core content shown on the donation program&apos;s card and page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" required defaultValue={program?.name ?? ""} />
          </Field>

          <Field label="Slug" htmlFor="slug" hint="Leave blank to generate one from the name.">
            <Input id="slug" name="slug" autoComplete="off" defaultValue={program?.slug ?? ""} />
          </Field>

          <Field label="Short Description" htmlFor="shortDescription" hint="Optional — shown on program cards.">
            <Textarea id="shortDescription" name="shortDescription" defaultValue={program?.shortDescription ?? ""} />
          </Field>

          <Field label="Content" htmlFor="content" hint="Optional — the full program page content.">
            <Textarea id="content" name="content" className="min-h-40" defaultValue={program?.content ?? ""} />
          </Field>

          <Field label="Donation Instructions" htmlFor="donationInstructions" hint="Optional — how to donate to this program.">
            <Textarea id="donationInstructions" name="donationInstructions" defaultValue={program?.donationInstructions ?? ""} />
          </Field>

          <Field label="Cover Image" htmlFor="coverImageId" hint="Optional — pick an existing Media item.">
            <MediaPicker name="coverImageId" media={media} defaultValue={program?.coverImageId ?? null} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>Only published donation programs are shown on the public website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Display Order" htmlFor="displayOrder" required>
            <Input
              id="displayOrder"
              name="displayOrder"
              type="number"
              step={1}
              required
              defaultValue={program?.displayOrder ?? 0}
            />
          </Field>

          <div className="flex items-center gap-3">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              defaultChecked={program?.isPublished ?? false}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="isPublished" className="text-label text-foreground">
              Publish this donation program
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              defaultChecked={program?.isFeatured ?? false}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="isFeatured" className="text-label text-foreground">
              Feature this donation program on the homepage
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
          {program ? "Save Changes" : "Create Program"}
        </Button>
      </div>
    </form>
  );
}
