"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface ContactLocationActionState {
  status: "idle" | "success" | "error";
  message: string;
}

const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/** Reads an optional Decimal-field input — `null` when blank, a validated numeric string otherwise. Prisma accepts a plain string for Decimal fields directly. */
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

interface ParsedContactLocationInput {
  mosqueName: string;
  shortDescription: string | null;
  address: string;
  district: string | null;
  city: string;
  province: string;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  googleMapsUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  openingTime: string;
  closingTime: string;
  operatingNotes: string | null;
  parking: boolean;
  accessibility: boolean;
  ablutionArea: boolean;
  restroom: boolean;
  navigationTitle: string | null;
  directionNotes: string | null;
}

function parseContactLocationForm(formData: FormData): ParsedContactLocationInput | { error: string } {
  const mosqueName = readOptionalString(formData, "mosqueName");
  if (!mosqueName) {
    return { error: "Please fill in the following required field: Mosque Name." };
  }

  const address = readOptionalString(formData, "address");
  if (!address) {
    return { error: "Please fill in the following required field: Address." };
  }

  const city = readOptionalString(formData, "city");
  if (!city) {
    return { error: "Please fill in the following required field: City." };
  }

  const province = readOptionalString(formData, "province");
  if (!province) {
    return { error: "Please fill in the following required field: Province." };
  }

  const openingTime = readOptionalString(formData, "openingTime");
  if (!openingTime) {
    return { error: "Please fill in the following required field: Opening Time." };
  }
  if (!TIME_PATTERN.test(openingTime)) {
    return { error: "Opening Time is not a valid time." };
  }

  const closingTime = readOptionalString(formData, "closingTime");
  if (!closingTime) {
    return { error: "Please fill in the following required field: Closing Time." };
  }
  if (!TIME_PATTERN.test(closingTime)) {
    return { error: "Closing Time is not a valid time." };
  }

  const latitude = parseOptionalDecimalField(formData, "latitude", "Latitude");
  if (latitude !== null && typeof latitude !== "string") {
    return latitude;
  }
  if (latitude !== null) {
    const latitudeValue = Number(latitude);
    if (latitudeValue < -90 || latitudeValue > 90) {
      return { error: "Latitude must be between -90 and 90." };
    }
  }

  const longitude = parseOptionalDecimalField(formData, "longitude", "Longitude");
  if (longitude !== null && typeof longitude !== "string") {
    return longitude;
  }
  if (longitude !== null) {
    const longitudeValue = Number(longitude);
    if (longitudeValue < -180 || longitudeValue > 180) {
      return { error: "Longitude must be between -180 and 180." };
    }
  }

  return {
    mosqueName,
    shortDescription: readOptionalString(formData, "shortDescription"),
    address,
    district: readOptionalString(formData, "district"),
    city,
    province,
    postalCode: readOptionalString(formData, "postalCode"),
    latitude,
    longitude,
    googleMapsUrl: readOptionalString(formData, "googleMapsUrl"),
    phone: readOptionalString(formData, "phone"),
    whatsapp: readOptionalString(formData, "whatsapp"),
    email: readOptionalString(formData, "email"),
    openingTime,
    closingTime,
    operatingNotes: readOptionalString(formData, "operatingNotes"),
    parking: formData.get("parking") !== null,
    accessibility: formData.get("accessibility") !== null,
    ablutionArea: formData.get("ablutionArea") !== null,
    restroom: formData.get("restroom") !== null,
    navigationTitle: readOptionalString(formData, "navigationTitle"),
    directionNotes: readOptionalString(formData, "directionNotes"),
  };
}

/**
 * Creates or updates the single ContactLocation record this admin page
 * manages — same singleton convention as `updatePrayerSettings`/`updateAbout`:
 * `findFirst()` decides whether this is the first save (create) or a later
 * one (update).
 */
export async function updateContactLocation(
  _prevState: ContactLocationActionState,
  formData: FormData
): Promise<ContactLocationActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to update the contact location." };
  }

  const parsed = parseContactLocationForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  try {
    const existing = await prisma.contactLocation.findFirst();

    if (existing) {
      await prisma.contactLocation.update({ where: { id: existing.id }, data: parsed });
    } else {
      await prisma.contactLocation.create({ data: parsed });
    }
  } catch (error) {
    console.error("Failed to save contact location:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/settings/contact");
  // The public homepage's Footer reads address/whatsapp/email (see
  // app/page.tsx) — same convention as updateHero/updateAbout/createEvent.
  revalidatePath("/");

  return { status: "success", message: "Contact location updated successfully." };
}
