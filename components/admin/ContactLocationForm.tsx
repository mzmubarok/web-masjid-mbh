"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { updateContactLocation } from "@/app/admin/settings/contact/action";
import type { ContactLocationActionState } from "@/app/admin/settings/contact/action";
import type { ContactLocation } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

// latitude/longitude arrive pre-serialized to string | null — Decimal
// objects can't cross the Server -> Client Component boundary as-is.
type ContactLocationFormValues = Omit<ContactLocation, "latitude" | "longitude"> & {
  latitude: string | null;
  longitude: string | null;
};

export interface ContactLocationFormProps {
  /** Null until the settings form is saved for the first time — saving then creates the singleton record. */
  location: ContactLocationFormValues | null;
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

const initialState: ContactLocationActionState = { status: "idle", message: "" };

export function ContactLocationForm({ location }: ContactLocationFormProps) {
  const [state, formAction, isPending] = useActionState(updateContactLocation, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>The mosque&apos;s identity and address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Mosque Name" htmlFor="mosqueName" required>
            <Input id="mosqueName" name="mosqueName" required defaultValue={location?.mosqueName ?? ""} />
          </Field>

          <Field label="Short Description" htmlFor="shortDescription" hint="Optional.">
            <Textarea id="shortDescription" name="shortDescription" defaultValue={location?.shortDescription ?? ""} />
          </Field>

          <Field label="Address" htmlFor="address" required>
            <Textarea id="address" name="address" required defaultValue={location?.address ?? ""} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="District" htmlFor="district" hint="Optional.">
              <Input id="district" name="district" defaultValue={location?.district ?? ""} />
            </Field>

            <Field label="City" htmlFor="city" required>
              <Input id="city" name="city" required defaultValue={location?.city ?? ""} />
            </Field>

            <Field label="Province" htmlFor="province" required>
              <Input id="province" name="province" required defaultValue={location?.province ?? ""} />
            </Field>

            <Field label="Postal Code" htmlFor="postalCode" hint="Optional.">
              <Input id="postalCode" name="postalCode" defaultValue={location?.postalCode ?? ""} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coordinates</CardTitle>
          <CardDescription>Optional — used to link to the mosque&apos;s location.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Latitude" htmlFor="latitude" hint="Optional. Between -90 and 90.">
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                defaultValue={location?.latitude?.toString() ?? ""}
              />
            </Field>

            <Field label="Longitude" htmlFor="longitude" hint="Optional. Between -180 and 180.">
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                defaultValue={location?.longitude?.toString() ?? ""}
              />
            </Field>
          </div>

          <Field label="Google Maps URL" htmlFor="googleMapsUrl" hint="Optional.">
            <Input id="googleMapsUrl" name="googleMapsUrl" type="url" autoComplete="off" defaultValue={location?.googleMapsUrl ?? ""} />
          </Field>

          <Field
            label="Google Maps Embed URL"
            htmlFor="googleMapsEmbedUrl"
            hint="Optional — shown as an interactive map on the homepage. From Google Maps: Share → Embed a map → copy the src URL (starts with https://www.google.com/maps/embed)."
          >
            <Input
              id="googleMapsEmbedUrl"
              name="googleMapsEmbedUrl"
              type="url"
              autoComplete="off"
              defaultValue={location?.googleMapsEmbedUrl ?? ""}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>Optional — how visitors can reach the mosque.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Phone" htmlFor="phone" hint="Optional.">
              <Input id="phone" name="phone" type="tel" autoComplete="off" defaultValue={location?.phone ?? ""} />
            </Field>

            <Field label="WhatsApp" htmlFor="whatsapp" hint="Optional.">
              <Input id="whatsapp" name="whatsapp" type="tel" autoComplete="off" defaultValue={location?.whatsapp ?? ""} />
            </Field>
          </div>

          <Field label="Email" htmlFor="email" hint="Optional.">
            <Input id="email" name="email" type="email" autoComplete="off" defaultValue={location?.email ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>When the mosque is open to visitors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Opening Time" htmlFor="openingTime" required>
              <Input id="openingTime" name="openingTime" type="time" required defaultValue={location?.openingTime ?? ""} />
            </Field>

            <Field label="Closing Time" htmlFor="closingTime" required>
              <Input id="closingTime" name="closingTime" type="time" required defaultValue={location?.closingTime ?? ""} />
            </Field>
          </div>

          <Field label="Operating Notes" htmlFor="operatingNotes" hint="Optional.">
            <Textarea id="operatingNotes" name="operatingNotes" defaultValue={location?.operatingNotes ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
          <CardDescription>Amenities available at the mosque.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Parking Description" htmlFor="parkingDescription" hint="Optional. Shown on the homepage's Visit Us section.">
            <Textarea
              id="parkingDescription"
              name="parkingDescription"
              defaultValue={location?.parkingDescription ?? ""}
            />
          </Field>

          <Field
            label="Accessibility Description"
            htmlFor="accessibilityDescription"
            hint="Optional. Shown on the homepage's Visit Us section."
          >
            <Textarea
              id="accessibilityDescription"
              name="accessibilityDescription"
              defaultValue={location?.accessibilityDescription ?? ""}
            />
          </Field>

          {(
            [
              ["ablutionArea", "Ablution Area"],
              ["restroom", "Restroom"],
            ] as const
          ).map(([name, label]) => (
            <div key={name} className="flex items-center gap-3">
              <input
                id={name}
                name={name}
                type="checkbox"
                defaultChecked={location?.[name] ?? false}
                className="size-5 shrink-0 rounded border border-input accent-primary"
              />
              <label htmlFor={name} className="text-label text-foreground">
                {label}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Information</CardTitle>
          <CardDescription>Optional — additional guidance shown to visitors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Navigation Title" htmlFor="navigationTitle" hint="Optional.">
            <Input id="navigationTitle" name="navigationTitle" defaultValue={location?.navigationTitle ?? ""} />
          </Field>

          <Field label="Direction Notes" htmlFor="directionNotes" hint="Optional.">
            <Textarea id="directionNotes" name="directionNotes" defaultValue={location?.directionNotes ?? ""} />
          </Field>
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
