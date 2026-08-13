"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface AboutActionState {
  status: "idle" | "success" | "error";
  message: string;
}

const REQUIRED_FIELDS = [
  ["title", "Title"],
  ["introduction", "Introduction"],
  ["history", "History"],
  ["vision", "Vision"],
  ["mission", "Mission"],
] as const;

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/**
 * Creates or updates the single About record this admin page manages.
 *
 * `id` (hidden field) is empty on the first save — there's no About row
 * yet, so one is created with the current admin as creator/editor. On every
 * later save it's the existing row's id, so this becomes a plain update.
 * Same single-record convention as `updateHero`: this UI only ever touches
 * one row, so "only one About can be published" holds automatically.
 *
 * Taglines (the three core-value cards) are a separate related model with
 * their own required `aboutId`, so they're managed by `updateTaglines`
 * below rather than as fields on this action.
 */
export async function updateAbout(
  _prevState: AboutActionState,
  formData: FormData
): Promise<AboutActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to update the About section." };
  }

  const id = readOptionalString(formData, "id");

  const missing: string[] = [];
  const required: Record<string, string> = {};

  for (const [key, label] of REQUIRED_FIELDS) {
    const value = readOptionalString(formData, key);
    if (!value) {
      missing.push(label);
    } else {
      required[key] = value;
    }
  }

  if (missing.length > 0) {
    return {
      status: "error",
      message: `Please fill in the following required fields: ${missing.join(", ")}.`,
    };
  }

  const aboutPageContent = readOptionalString(formData, "aboutPageContent");
  const isPublished = formData.get("isPublished") !== null;

  try {
    const existing = id ? await prisma.about.findUnique({ where: { id } }) : null;

    // Only stamp publishedAt on the unpublished -> published transition;
    // clear it on unpublish; leave it untouched while staying published.
    const publishedAt = !isPublished ? null : existing?.isPublished ? existing.publishedAt : new Date();

    if (existing) {
      await prisma.about.update({
        where: { id: existing.id },
        data: {
          title: required.title,
          introduction: required.introduction,
          history: required.history,
          vision: required.vision,
          mission: required.mission,
          aboutPageContent,
          isPublished,
          publishedAt,
          updatedById: session.user.id,
        },
      });
    } else {
      await prisma.about.create({
        data: {
          title: required.title,
          introduction: required.introduction,
          history: required.history,
          vision: required.vision,
          mission: required.mission,
          aboutPageContent,
          isPublished,
          publishedAt,
          createdById: session.user.id,
          updatedById: session.user.id,
        },
      });
    }
  } catch (error) {
    console.error("Failed to update about:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/about");
  // The public homepage will read the same About content once it's wired up.
  revalidatePath("/");

  return { status: "success", message: "About section updated successfully." };
}

export interface TaglineActionState {
  status: "idle" | "success" | "error";
  message: string;
}

const TAGLINE_SLOTS = [1, 2, 3] as const;

/**
 * Creates or updates the three Tagline slots (sortOrder 1-3) belonging to
 * the given About record. A Tagline cannot exist without an About record,
 * so `aboutId` (hidden field, sourced from the About record already loaded
 * on the page) is re-verified against the database before writing anything.
 *
 * Each slot is independent: leaving both fields blank on a slot that has no
 * existing row skips it (nothing to save yet); leaving both blank on a slot
 * that already has a row is a validation error, since title/description are
 * required whenever a row exists — this action never deletes a Tagline.
 * Existing rows outside slots 1-3 (if any) are never touched.
 */
export async function updateTaglines(
  _prevState: TaglineActionState,
  formData: FormData
): Promise<TaglineActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to update taglines." };
  }

  const aboutId = readOptionalString(formData, "aboutId");

  if (!aboutId) {
    return {
      status: "error",
      message: "Save the About content above first — taglines need an About record to belong to.",
    };
  }

  const about = await prisma.about.findUnique({ where: { id: aboutId } });

  if (!about) {
    return {
      status: "error",
      message: "The About record this tagline belongs to no longer exists. Please reload the page.",
    };
  }

  const existingTaglines = await prisma.tagline.findMany({ where: { aboutId } });
  const existingBySortOrder = new Map(existingTaglines.map((tagline) => [tagline.sortOrder, tagline]));

  const errors: string[] = [];
  const slotsToSave: { sortOrder: number; title: string; description: string }[] = [];

  for (const sortOrder of TAGLINE_SLOTS) {
    const title = readOptionalString(formData, `tagline${sortOrder}Title`);
    const description = readOptionalString(formData, `tagline${sortOrder}Description`);
    const hasExisting = existingBySortOrder.has(sortOrder);

    if (!title && !description) {
      if (hasExisting) {
        errors.push(`Tagline ${sortOrder}: Title and Description are required.`);
      }
      // No existing row and both fields blank — slot just hasn't been filled in yet.
      continue;
    }

    if (!title || !description) {
      errors.push(`Tagline ${sortOrder}: Title and Description are required.`);
      continue;
    }

    slotsToSave.push({ sortOrder, title, description });
  }

  if (errors.length > 0) {
    return { status: "error", message: errors.join(" ") };
  }

  if (slotsToSave.length === 0) {
    return { status: "error", message: "Enter a title and description for at least one tagline." };
  }

  try {
    await prisma.$transaction(
      slotsToSave.map(({ sortOrder, title, description }) =>
        prisma.tagline.upsert({
          where: { aboutId_sortOrder: { aboutId, sortOrder } },
          update: { title, description },
          create: { aboutId, sortOrder, title, description },
        })
      )
    );
  } catch (error) {
    console.error("Failed to update taglines:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/about");
  revalidatePath("/");

  return { status: "success", message: "Taglines updated successfully." };
}
