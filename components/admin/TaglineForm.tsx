"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { updateTaglines } from "@/app/admin/about/action";
import type { Tagline } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export interface TaglineFormProps {
  /** id of the About record taglines belong to — null when no About record exists yet. */
  aboutId: string | null;
  taglines: Tagline[];
}

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}

/** Labeled form row — every input in this form goes through this so the label/id pairing is never missed. */
function Field({ label, htmlFor, required, children }: FieldProps) {
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
    </div>
  );
}

const TAGLINE_SLOTS = [1, 2, 3] as const;

const initialState = { status: "idle", message: "" } as const;

export function TaglineForm({ aboutId, taglines }: TaglineFormProps) {
  const [state, formAction, isPending] = useActionState(updateTaglines, initialState);

  if (!aboutId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taglines</CardTitle>
          <CardDescription>The three core-value cards shown below the About introduction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-small text-muted-foreground">
            Save the About content above first — taglines need an About record to belong to.
          </p>
        </CardContent>
      </Card>
    );
  }

  const bySortOrder = new Map(taglines.map((tagline) => [tagline.sortOrder, tagline]));

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Taglines</CardTitle>
          <CardDescription>
            The three core-value cards shown below the About introduction. Each slot is optional on
            its own, but a slot with any content needs both a title and a description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input type="hidden" name="aboutId" value={aboutId} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {TAGLINE_SLOTS.map((sortOrder) => {
              const tagline = bySortOrder.get(sortOrder);

              return (
                <div
                  key={sortOrder}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4"
                >
                  <p className="text-label text-muted-foreground">
                    Tagline {sortOrder} <span className="text-caption">· Sort Order: {sortOrder}</span>
                  </p>

                  <Field label="Title" htmlFor={`tagline${sortOrder}Title`}>
                    <Input
                      id={`tagline${sortOrder}Title`}
                      name={`tagline${sortOrder}Title`}
                      defaultValue={tagline?.title ?? ""}
                    />
                  </Field>

                  <Field label="Description" htmlFor={`tagline${sortOrder}Description`}>
                    <Textarea
                      id={`tagline${sortOrder}Description`}
                      name={`tagline${sortOrder}Description`}
                      defaultValue={tagline?.description ?? ""}
                    />
                  </Field>

                  {tagline?.iconId ? (
                    <p className="text-caption text-muted-foreground">
                      Icon ID: {tagline.iconId} (media selection not available yet)
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
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
              Save Taglines
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
