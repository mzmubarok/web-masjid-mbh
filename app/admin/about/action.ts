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
 * Taglines (the three core-value cards) are a separate related model and
 * are intentionally not managed here — see the implementation report.
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
