"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { createEventCategory, updateEventCategory } from "@/app/admin/events/categories/action";
import type { EventCategory } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface EventCategoryFormProps {
  /** Omit (or pass null) to render a "create new" form; pass a category to edit it in place. */
  category?: EventCategory | null;
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

/** One form, reused for both creating and editing an EventCategory. */
export function EventCategoryForm({ category = null }: EventCategoryFormProps) {
  const action = category ? updateEventCategory : createEventCategory;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>{category ? "Edit Category" : "Create Category"}</CardTitle>
          <CardDescription>
            {category
              ? "Update this event category's details."
              : "Add a new category events can be organized under."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {category ? <input type="hidden" name="id" value={category.id} /> : null}

          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" required defaultValue={category?.name ?? ""} />
          </Field>

          <Field label="Slug" htmlFor="slug" hint="Leave blank to generate one from the name.">
            <Input id="slug" name="slug" autoComplete="off" defaultValue={category?.slug ?? ""} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Color" htmlFor="color" hint="e.g. #2563eb">
              <Input id="color" name="color" autoComplete="off" defaultValue={category?.color ?? ""} />
            </Field>

            <Field label="Sort Order" htmlFor="sortOrder" required>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                step={1}
                required
                defaultValue={category?.sortOrder ?? 0}
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
              {category ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
