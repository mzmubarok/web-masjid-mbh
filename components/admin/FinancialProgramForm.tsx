"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { createFinancialProgram, updateFinancialProgram } from "@/app/admin/finance/action";
import type { FinancialProgram, Media } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { cn } from "@/lib/utils";

export interface FinancialProgramFormProps {
  /** Omit (or pass null) to render a "create new" form; pass a program to edit it in place. */
  program?: FinancialProgram | null;
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

/** One form, reused for both creating and editing a FinancialProgram. */
export function FinancialProgramForm({ program = null, media }: FinancialProgramFormProps) {
  const action = program ? updateFinancialProgram : createFinancialProgram;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>{program ? "Edit Financial Program" : "Create Financial Program"}</CardTitle>
          <CardDescription>
            {program
              ? "Update this financial program's details."
              : "Add a new program donors and reports can be organized under."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {program ? <input type="hidden" name="id" value={program.id} /> : null}

          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" required defaultValue={program?.name ?? ""} />
          </Field>

          <Field label="Slug" htmlFor="slug" hint="Leave blank to generate one from the name.">
            <Input id="slug" name="slug" autoComplete="off" defaultValue={program?.slug ?? ""} />
          </Field>

          <Field label="Description" htmlFor="description" hint="Optional.">
            <Textarea id="description" name="description" defaultValue={program?.description ?? ""} />
          </Field>

          <Field label="Icon" htmlFor="iconId" hint="Optional — pick an existing Media item.">
            <MediaPicker name="iconId" media={media} defaultValue={program?.iconId ?? null} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Color" htmlFor="color" hint="e.g. #2563eb">
              <Input id="color" name="color" autoComplete="off" defaultValue={program?.color ?? ""} />
            </Field>

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
              {program ? "Save Changes" : "Create Program"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
