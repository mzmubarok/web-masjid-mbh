"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface HeroActionState {
  status: "idle" | "success" | "error";
  message: string;
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/**
 * Creates or updates the single Hero record this admin page manages.
 *
 * `id` (hidden field) is empty on the first save — there's no Hero row yet,
 * so one is created with the current admin as creator/editor. On every
 * later save it's the existing row's id, so this becomes a plain update.
 * This UI only ever touches that one row, so "only one Hero can be
 * published" (the schema's own rule) holds automatically — there's no
 * sibling row it could ever leave published.
 */
export async function updateHero(
  _prevState: HeroActionState,
  formData: FormData
): Promise<HeroActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to update the Hero section." };
  }

  const id = readOptionalString(formData, "id");
  const title = readOptionalString(formData, "title");

  if (!title) {
    return { status: "error", message: "Please fill in the following required field: Title." };
  }

  const subtitle = readOptionalString(formData, "subtitle");
  const backgroundImageId = readOptionalString(formData, "backgroundImageId");
  const isPublished = formData.get("isPublished") !== null;

  if (backgroundImageId) {
    const media = await prisma.media.findUnique({ where: { id: backgroundImageId } });
    if (!media) {
      return {
        status: "error",
        message: "Background Image ID does not match any existing media item.",
      };
    }
  }

  try {
    const existing = id ? await prisma.hero.findUnique({ where: { id } }) : null;

    // Only stamp publishedAt on the unpublished -> published transition;
    // clear it on unpublish; leave it untouched while staying published.
    const publishedAt = !isPublished ? null : (existing?.isPublished ? existing.publishedAt : new Date());

    if (existing) {
      await prisma.hero.update({
        where: { id: existing.id },
        data: {
          title,
          subtitle,
          backgroundImageId,
          isPublished,
          publishedAt,
          updatedById: session.user.id,
        },
      });
    } else {
      await prisma.hero.create({
        data: {
          title,
          subtitle,
          backgroundImageId,
          isPublished,
          publishedAt,
          createdById: session.user.id,
          updatedById: session.user.id,
        },
      });
    }
  } catch (error) {
    console.error("Failed to update hero:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/hero");
  // The public homepage will read the same Hero content once it's wired up.
  revalidatePath("/");

  return { status: "success", message: "Hero section updated successfully." };
}
