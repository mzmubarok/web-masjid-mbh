"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LFNU_PARAMETERS } from "@/lib/prayer/prayer-parameters";

export interface PrayerSettingsActionState {
  status: "idle" | "success" | "error";
  message: string;
}

const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/** Reads a required Decimal-field input as a validated numeric string — Prisma accepts a plain string for Decimal fields directly. */
function parseDecimalField(formData: FormData, key: string, label: string): string | { error: string } {
  const raw = formData.get(key);
  const text = typeof raw === "string" ? raw.trim() : "";

  if (!text) {
    return { error: `Please fill in the following required field: ${label}.` };
  }

  if (!DECIMAL_PATTERN.test(text)) {
    return { error: `${label} must be a valid number.` };
  }

  return text;
}

/** Reads an optional Decimal-field input — `null` when blank, a validated numeric string otherwise. */
function parseOptionalDecimalField(formData: FormData, key: string, label: string): string | null | { error: string } {
  const text = readOptionalString(formData, key);
  if (!text) {
    return null;
  }

  if (!DECIMAL_PATTERN.test(text)) {
    return { error: `${label} must be a valid number.` };
  }

  return text;
}

// Independent of calculationMode — see the schema's own comment on these
// columns. Indonesian names match this project's established prayer-name
// convention (format-prayer-schedule.ts's PRAYER_LABELS).
const IHTIYATH_FIELDS = [
  { key: "fajrIhtiyath", label: "Subuh Ihtiyath" },
  { key: "sunriseIhtiyath", label: "Terbit Ihtiyath" },
  { key: "dhuhrIhtiyath", label: "Zuhur Ihtiyath" },
  { key: "asrIhtiyath", label: "Asar Ihtiyath" },
  { key: "maghribIhtiyath", label: "Maghrib Ihtiyath" },
  { key: "ishaIhtiyath", label: "Isya Ihtiyath" },
] as const;

type ParsedIhtiyath = Record<(typeof IHTIYATH_FIELDS)[number]["key"], number>;

/** Integer, 0–15 minutes — matches the column's own constraints. */
function parseIhtiyathField(formData: FormData, key: string, label: string): number | { error: string } {
  const text = readOptionalString(formData, key);
  if (!text) {
    return { error: `Please fill in the following required field: ${label}.` };
  }

  const value = Number(text);
  if (!Number.isInteger(value)) {
    return { error: `${label} must be a whole number of minutes.` };
  }
  if (value < 0 || value > 15) {
    return { error: `${label} must be between 0 and 15 minutes.` };
  }

  return value;
}

/** All six Ihtiyath fields at once — parsed the same way regardless of calculationMode, since Ihtiyath is independent of it. */
function parseIhtiyathFields(formData: FormData): ParsedIhtiyath | { error: string } {
  const result = {} as ParsedIhtiyath;
  for (const { key, label } of IHTIYATH_FIELDS) {
    const parsed = parseIhtiyathField(formData, key, label);
    if (typeof parsed !== "number") {
      return parsed;
    }
    result[key] = parsed;
  }
  return result;
}

interface ParsedPrayerSettingsInput extends ParsedIhtiyath {
  mosqueName: string;
  latitude: string;
  longitude: string;
  timezone: string;
  calculationMethod: string;
  calculationMode: "LFNU" | "CUSTOM";
  madhab: string;
  isAutomatic: boolean;
  fajrAngle: string | null;
  ishaAngle: string | null;
}

function parsePrayerSettingsForm(formData: FormData): ParsedPrayerSettingsInput | { error: string } {
  const mosqueName = readOptionalString(formData, "mosqueName");
  if (!mosqueName) {
    return { error: "Please fill in the following required field: Mosque Name." };
  }

  const timezone = readOptionalString(formData, "timezone");
  if (!timezone) {
    return { error: "Please fill in the following required field: Timezone." };
  }

  const calculationMethod = readOptionalString(formData, "calculationMethod");
  if (!calculationMethod) {
    return { error: "Please fill in the following required field: Calculation Method." };
  }

  const latitude = parseDecimalField(formData, "latitude", "Latitude");
  if (typeof latitude !== "string") {
    return latitude;
  }
  const latitudeValue = Number(latitude);
  if (latitudeValue < -90 || latitudeValue > 90) {
    return { error: "Latitude must be between -90 and 90." };
  }

  const longitude = parseDecimalField(formData, "longitude", "Longitude");
  if (typeof longitude !== "string") {
    return longitude;
  }
  const longitudeValue = Number(longitude);
  if (longitudeValue < -180 || longitudeValue > 180) {
    return { error: "Longitude must be between -180 and 180." };
  }

  // LFNU is the default whenever the submitted value isn't literally
  // "CUSTOM" — matches the form's own radio default and means a missing/
  // tampered field fails safe into the standard mode, not an unvalidated one.
  const calculationMode: "LFNU" | "CUSTOM" = formData.get("calculationMode") === "CUSTOM" ? "CUSTOM" : "LFNU";

  // Parsed once, outside the mode branch below — Ihtiyath is completely
  // independent of calculationMode, editable and required in both.
  const ihtiyath = parseIhtiyathFields(formData);
  if ("error" in ihtiyath) {
    return ihtiyath;
  }

  // LFNU mode always uses LFNU_PARAMETERS (see lib/prayer/prayer-parameters.ts)
  // — its Fajr Angle/Isha Angle/Madhab inputs are disabled in the form and
  // never submitted, so they're never required or read here for this mode.
  if (calculationMode === "LFNU") {
    return {
      mosqueName,
      latitude,
      longitude,
      timezone,
      calculationMethod,
      calculationMode,
      madhab: LFNU_PARAMETERS.madhab,
      isAutomatic: formData.get("isAutomatic") !== null,
      fajrAngle: String(LFNU_PARAMETERS.fajrAngle),
      ishaAngle: String(LFNU_PARAMETERS.ishaAngle),
      ...ihtiyath,
    };
  }

  const madhab = readOptionalString(formData, "madhab");
  if (!madhab) {
    return { error: "Please fill in the following required field: Madhab." };
  }

  const fajrAngle = parseOptionalDecimalField(formData, "fajrAngle", "Fajr Angle");
  if (fajrAngle !== null && typeof fajrAngle !== "string") {
    return fajrAngle;
  }

  const ishaAngle = parseOptionalDecimalField(formData, "ishaAngle", "Isha Angle");
  if (ishaAngle !== null && typeof ishaAngle !== "string") {
    return ishaAngle;
  }

  return {
    mosqueName,
    latitude,
    longitude,
    timezone,
    calculationMethod,
    calculationMode,
    madhab,
    isAutomatic: formData.get("isAutomatic") !== null,
    fajrAngle,
    ishaAngle,
    ...ihtiyath,
  };
}

/**
 * Creates or updates the single PrayerSetting record this admin page manages
 * — same singleton convention as `updateAbout`/`updateHero`: `findFirst()`
 * decides whether this is the first save (create) or a later one (update).
 */
export async function updatePrayerSettings(
  _prevState: PrayerSettingsActionState,
  formData: FormData
): Promise<PrayerSettingsActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to update prayer settings." };
  }

  const parsed = parsePrayerSettingsForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const data = {
    mosqueName: parsed.mosqueName,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    timezone: parsed.timezone,
    calculationMethod: parsed.calculationMethod,
    calculationMode: parsed.calculationMode,
    madhab: parsed.madhab,
    isAutomatic: parsed.isAutomatic,
    fajrAngle: parsed.fajrAngle,
    ishaAngle: parsed.ishaAngle,
    fajrIhtiyath: parsed.fajrIhtiyath,
    sunriseIhtiyath: parsed.sunriseIhtiyath,
    dhuhrIhtiyath: parsed.dhuhrIhtiyath,
    asrIhtiyath: parsed.asrIhtiyath,
    maghribIhtiyath: parsed.maghribIhtiyath,
    ishaIhtiyath: parsed.ishaIhtiyath,
  };

  try {
    const existing = await prisma.prayerSetting.findFirst();

    if (existing) {
      await prisma.prayerSetting.update({ where: { id: existing.id }, data });
    } else {
      await prisma.prayerSetting.create({ data });
    }
  } catch (error) {
    console.error("Failed to save prayer settings:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/settings/prayer");
  // The homepage reads PrayerSetting too (see app/page.tsx) — same
  // convention every other CMS action already follows (Hero, About,
  // Events, ...). Missing here before now, so an admin edit wouldn't
  // reach "/" until some unrelated action happened to revalidate it.
  revalidatePath("/");

  return { status: "success", message: "Prayer settings updated successfully." };
}
