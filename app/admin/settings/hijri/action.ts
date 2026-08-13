"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { parseDateOnly } from "@/lib/date";

export interface HijriOverrideActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export interface DeleteHijriOverrideState {
  status: "idle" | "error";
  message: string;
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/** True when `error` is a Prisma unique-constraint violation (P2002). */
function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

interface ParsedHijriOverrideInput {
  gregorianDate: Date;
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  notes: string | null;
  source: string | null;
}

function parseHijriOverrideForm(formData: FormData): ParsedHijriOverrideInput | { error: string } {
  const gregorianDateText = readOptionalString(formData, "gregorianDate");
  if (!gregorianDateText) {
    return { error: "Please fill in the following required field: Gregorian Date." };
  }

  // Parsed as UTC midnight (see lib/date.ts) — the calendar date, nothing
  // more, so the same date picked in the form can never drift to a
  // different day because of timezone conversion.
  const gregorianDate = parseDateOnly(gregorianDateText);
  if (!gregorianDate) {
    return { error: "Gregorian Date is not a valid date." };
  }

  const hijriDayRaw = formData.get("hijriDay");
  const hijriDayText = typeof hijriDayRaw === "string" ? hijriDayRaw.trim() : "";
  if (!hijriDayText) {
    return { error: "Please fill in the following required field: Hijri Day." };
  }
  const hijriDay = Number(hijriDayText);
  if (!Number.isInteger(hijriDay) || hijriDay < 1 || hijriDay > 30) {
    return { error: "Hijri Day must be an integer between 1 and 30." };
  }

  const hijriMonthRaw = formData.get("hijriMonth");
  const hijriMonthText = typeof hijriMonthRaw === "string" ? hijriMonthRaw.trim() : "";
  if (!hijriMonthText) {
    return { error: "Please fill in the following required field: Hijri Month." };
  }
  const hijriMonth = Number(hijriMonthText);
  if (!Number.isInteger(hijriMonth) || hijriMonth < 1 || hijriMonth > 12) {
    return { error: "Hijri Month must be an integer between 1 and 12." };
  }

  const hijriYearRaw = formData.get("hijriYear");
  const hijriYearText = typeof hijriYearRaw === "string" ? hijriYearRaw.trim() : "";
  if (!hijriYearText) {
    return { error: "Please fill in the following required field: Hijri Year." };
  }
  const hijriYear = Number(hijriYearText);
  if (!Number.isInteger(hijriYear) || hijriYear < 1) {
    return { error: "Hijri Year must be a valid positive integer." };
  }

  return {
    gregorianDate,
    hijriDay,
    hijriMonth,
    hijriYear,
    notes: readOptionalString(formData, "notes"),
    source: readOptionalString(formData, "source"),
  };
}

/** Creates a new HijriOverride. `createdById` is always the current session's user — never client-supplied. */
export async function createHijriOverride(
  _prevState: HijriOverrideActionState,
  formData: FormData
): Promise<HijriOverrideActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage Hijri overrides." };
  }

  const parsed = parseHijriOverrideForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const dateTaken = await prisma.hijriOverride.findUnique({ where: { gregorianDate: parsed.gregorianDate } });
  if (dateTaken) {
    return { status: "error", message: "An override for this Gregorian date already exists." };
  }

  try {
    await prisma.hijriOverride.create({
      data: {
        gregorianDate: parsed.gregorianDate,
        hijriDay: parsed.hijriDay,
        hijriMonth: parsed.hijriMonth,
        hijriYear: parsed.hijriYear,
        notes: parsed.notes,
        source: parsed.source,
        createdById: session.user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "An override for this Gregorian date already exists." };
    }
    console.error("Failed to create Hijri override:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/settings/hijri");
  redirect("/admin/settings/hijri");
}

/** Updates an existing HijriOverride by id. `createdById` is never changed — the schema has no "updatedBy" field for this model. */
export async function updateHijriOverride(
  _prevState: HijriOverrideActionState,
  formData: FormData
): Promise<HijriOverrideActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage Hijri overrides." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing override id." };
  }

  const existing = await prisma.hijriOverride.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This override no longer exists. Please reload the page." };
  }

  const parsed = parseHijriOverrideForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const conflict = await prisma.hijriOverride.findFirst({
    where: { id: { not: id }, gregorianDate: parsed.gregorianDate },
  });
  if (conflict) {
    return { status: "error", message: "Another override already exists for this Gregorian date." };
  }

  try {
    await prisma.hijriOverride.update({
      where: { id },
      data: {
        gregorianDate: parsed.gregorianDate,
        hijriDay: parsed.hijriDay,
        hijriMonth: parsed.hijriMonth,
        hijriYear: parsed.hijriYear,
        notes: parsed.notes,
        source: parsed.source,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "Another override already exists for this Gregorian date." };
    }
    console.error("Failed to update Hijri override:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/settings/hijri");
  revalidatePath(`/admin/settings/hijri/${id}/edit`);
  redirect("/admin/settings/hijri");
}

/** Deletes a HijriOverride. Only the override row is removed — its creator (User) is never touched. */
export async function deleteHijriOverride(
  _prevState: DeleteHijriOverrideState,
  formData: FormData
): Promise<DeleteHijriOverrideState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage Hijri overrides." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing override id." };
  }

  const existing = await prisma.hijriOverride.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This override no longer exists. Please reload the page." };
  }

  try {
    await prisma.hijriOverride.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete Hijri override:", error);
    return { status: "error", message: "Something went wrong while deleting. Please try again." };
  }

  revalidatePath("/admin/settings/hijri");

  // The row disappears from the revalidated list on success — nothing left
  // on the page to attach a success message to.
  return { status: "idle", message: "" };
}
