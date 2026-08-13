"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { createHijriOverride, updateHijriOverride } from "@/app/admin/settings/hijri/action";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

/**
 * Plain, pre-serialized shape for the form — `gregorianDate` is a
 * `YYYY-MM-DD` string, never a Prisma `Date`, since Date objects (like
 * Decimal) shouldn't be passed from a Server Component into a Client
 * Component as-is. Only the fields this form actually needs.
 */
export interface HijriOverrideFormValues {
  id: string;
  gregorianDate: string;
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  notes: string | null;
  source: string | null;
}

export interface HijriOverrideFormProps {
  /** Omit (or pass null) to render a "create new" form; pass an override to edit it in place. */
  override?: HijriOverrideFormValues | null;
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

/** One form, reused for both creating and editing a HijriOverride. */
export function HijriOverrideForm({ override = null }: HijriOverrideFormProps) {
  const action = override ? updateHijriOverride : createHijriOverride;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>{override ? "Edit Override" : "Create Override"}</CardTitle>
          <CardDescription>
            {override
              ? "Update this Hijri date override."
              : "The Gregorian date is the lookup key every override is matched against."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {override ? <input type="hidden" name="id" value={override.id} /> : null}

          <Field label="Gregorian Date" htmlFor="gregorianDate" required hint="The calendar date this override applies to.">
            <Input
              id="gregorianDate"
              name="gregorianDate"
              type="date"
              required
              defaultValue={override?.gregorianDate ?? ""}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Hijri Day" htmlFor="hijriDay" required hint="1–30">
              <Input
                id="hijriDay"
                name="hijriDay"
                type="number"
                step={1}
                min={1}
                max={30}
                required
                defaultValue={override?.hijriDay ?? ""}
              />
            </Field>

            <Field label="Hijri Month" htmlFor="hijriMonth" required hint="1–12">
              <Input
                id="hijriMonth"
                name="hijriMonth"
                type="number"
                step={1}
                min={1}
                max={12}
                required
                defaultValue={override?.hijriMonth ?? ""}
              />
            </Field>

            <Field label="Hijri Year" htmlFor="hijriYear" required>
              <Input
                id="hijriYear"
                name="hijriYear"
                type="number"
                step={1}
                min={1}
                required
                defaultValue={override?.hijriYear ?? ""}
              />
            </Field>
          </div>

          <Field label="Source" htmlFor="source" hint="Optional — e.g. the announcement this override is based on.">
            <Input id="source" name="source" defaultValue={override?.source ?? ""} />
          </Field>

          <Field label="Notes" htmlFor="notes" hint="Optional.">
            <Textarea id="notes" name="notes" defaultValue={override?.notes ?? ""} />
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
              {override ? "Save Changes" : "Create Override"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
