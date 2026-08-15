"use client";

import { useActionState, useState } from "react";
import type { ReactNode } from "react";

import { updatePrayerSettings } from "@/app/admin/settings/prayer/action";
import type { PrayerSettingsActionState } from "@/app/admin/settings/prayer/action";
import type { PrayerSetting } from "@/lib/generated/prisma/client";
import { LFNU_PARAMETERS } from "@/lib/prayer/prayer-parameters";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// latitude/longitude/fajrAngle/ishaAngle arrive pre-serialized to string |
// null — Decimal objects can't cross the Server -> Client Component
// boundary as-is.
type PrayerSettingsFormValues = Omit<PrayerSetting, "latitude" | "longitude" | "fajrAngle" | "ishaAngle"> & {
  latitude: string;
  longitude: string;
  fajrAngle: string | null;
  ishaAngle: string | null;
};

export interface PrayerSettingsFormProps {
  /** Null until the settings form is saved for the first time — saving then creates the singleton record. */
  settings: PrayerSettingsFormValues | null;
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

// As documented in docs/modules/08_PrayerSettings.md's "Calculation Methods"
// section — the project's only established list. Stored verbatim as the
// field's plain-string value (the schema has no enum for this).
const CALCULATION_METHODS = [
  "Ministry of Religious Affairs Indonesia",
  "Muslim World League",
  "Umm Al-Qura",
  "Egyptian General Authority",
  "University of Islamic Sciences Karachi",
  "ISNA",
] as const;

// As documented in the same file ("madhab | Enum | Yes | Shafi / Hanafi").
const MADHABS = ["Shafi", "Hanafi"] as const;

// Names match format-prayer-schedule.ts's own PRAYER_LABELS — the same
// Indonesian prayer names shown on the homepage schedule these adjust.
const IHTIYATH_INPUTS = [
  { key: "fajrIhtiyath", label: "Subuh" },
  { key: "sunriseIhtiyath", label: "Terbit" },
  { key: "dhuhrIhtiyath", label: "Zuhur" },
  { key: "asrIhtiyath", label: "Asar" },
  { key: "maghribIhtiyath", label: "Maghrib" },
  { key: "ishaIhtiyath", label: "Isya" },
] as const;

const initialState: PrayerSettingsActionState = { status: "idle", message: "" };

export function PrayerSettingsForm({ settings }: PrayerSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updatePrayerSettings, initialState);

  // LFNU is the default mode — Fajr Angle/Isha Angle/Madhab are then fixed
  // by the standard itself (see LFNU_PARAMETERS) and disabled below, so
  // FormData never carries submitted values for them; action.ts's own
  // parsing branches the same way, independently of whatever's here.
  const [calculationMode, setCalculationMode] = useState<"LFNU" | "CUSTOM">(
    settings?.calculationMode === "CUSTOM" ? "CUSTOM" : "LFNU"
  );
  const [madhab, setMadhab] = useState(settings?.madhab ?? "");
  const [fajrAngle, setFajrAngle] = useState(settings?.fajrAngle?.toString() ?? "");
  const [ishaAngle, setIshaAngle] = useState(settings?.ishaAngle?.toString() ?? "");
  const isLfnu = calculationMode === "LFNU";

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>The mosque&apos;s identity and coordinates used to calculate prayer times.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Mosque Name" htmlFor="mosqueName" required>
            <Input id="mosqueName" name="mosqueName" required defaultValue={settings?.mosqueName ?? ""} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Latitude" htmlFor="latitude" required hint="Between -90 and 90.">
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                required
                defaultValue={settings?.latitude.toString() ?? ""}
              />
            </Field>

            <Field label="Longitude" htmlFor="longitude" required hint="Between -180 and 180.">
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                required
                defaultValue={settings?.longitude.toString() ?? ""}
              />
            </Field>
          </div>

          <Field label="Timezone" htmlFor="timezone" required hint="e.g. Asia/Jakarta">
            <Input id="timezone" name="timezone" required defaultValue={settings?.timezone ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculation</CardTitle>
          <CardDescription>How prayer times are calculated for this mosque.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Calculation Mode"
            htmlFor="calculationMode"
            required
            hint="Lembaga Falakiyah NU is this site's standard — Custom allows a different Fajr/Isha angle and madhab."
          >
            <select
              id="calculationMode"
              name="calculationMode"
              required
              value={calculationMode}
              onChange={(event) => setCalculationMode(event.target.value === "CUSTOM" ? "CUSTOM" : "LFNU")}
              className={selectClassName}
            >
              <option value="LFNU">Lembaga Falakiyah NU (Default)</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Calculation Method" htmlFor="calculationMethod" required>
              <select
                id="calculationMethod"
                name="calculationMethod"
                required
                defaultValue={settings?.calculationMethod ?? ""}
                className={selectClassName}
              >
                <option value="" disabled>
                  Select a method
                </option>
                {CALCULATION_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Madhab"
              htmlFor="madhab"
              required={!isLfnu}
              hint={isLfnu ? "Fixed by the LFNU standard." : "Determines Asr calculation."}
            >
              <select
                id="madhab"
                name="madhab"
                required={!isLfnu}
                disabled={isLfnu}
                value={isLfnu ? LFNU_PARAMETERS.madhab : madhab}
                onChange={(event) => setMadhab(event.target.value)}
                className={selectClassName}
              >
                <option value="" disabled>
                  Select a madhab
                </option>
                {MADHABS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isAutomatic"
              name="isAutomatic"
              type="checkbox"
              defaultChecked={settings?.isAutomatic ?? true}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="isAutomatic" className="text-label text-foreground">
              Calculate prayer times automatically
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Fajr Angle"
              htmlFor="fajrAngle"
              hint={isLfnu ? "Fixed by the LFNU standard." : "Optional — only needed for a custom calculation method."}
            >
              <Input
                id="fajrAngle"
                name="fajrAngle"
                type="number"
                step="any"
                disabled={isLfnu}
                value={isLfnu ? LFNU_PARAMETERS.fajrAngle : fajrAngle}
                onChange={(event) => setFajrAngle(event.target.value)}
              />
            </Field>

            <Field
              label="Isha Angle"
              htmlFor="ishaAngle"
              hint={isLfnu ? "Fixed by the LFNU standard." : "Optional — only needed for a custom calculation method."}
            >
              <Input
                id="ishaAngle"
                name="ishaAngle"
                type="number"
                step="any"
                disabled={isLfnu}
                value={isLfnu ? LFNU_PARAMETERS.ishaAngle : ishaAngle}
                onChange={(event) => setIshaAngle(event.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prayer Time Adjustment (Ihtiyath)</CardTitle>
          <CardDescription>
            Extra safety minutes added to each prayer&apos;s calculated time — independent of Calculation Mode
            above, always editable in both LFNU and Custom.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {IHTIYATH_INPUTS.map(({ key, label }) => (
              <Field key={key} label={label} htmlFor={key} required hint="0–15 minutes.">
                <Input
                  id={key}
                  name={key}
                  type="number"
                  min={0}
                  max={15}
                  step={1}
                  required
                  defaultValue={settings?.[key] ?? 0}
                />
              </Field>
            ))}
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
          Save Changes
        </Button>
      </div>
    </form>
  );
}
