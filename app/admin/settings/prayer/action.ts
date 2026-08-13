"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

interface ParsedPrayerSettingsInput {
  mosqueName: string;
  latitude: string;
  longitude: string;
  timezone: string;
  calculationMethod: string;
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

  const madhab = readOptionalString(formData, "madhab");
  if (!madhab) {
    return { error: "Please fill in the following required field: Madhab." };
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
    madhab,
    isAutomatic: formData.get("isAutomatic") !== null,
    fajrAngle,
    ishaAngle,
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
    madhab: parsed.madhab,
    isAutomatic: parsed.isAutomatic,
    fajrAngle: parsed.fajrAngle,
    ishaAngle: parsed.ishaAngle,
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

  return { status: "success", message: "Prayer settings updated successfully." };
}
