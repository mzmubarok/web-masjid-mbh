"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { slugify } from "@/lib/slug";

export interface DonationProgramActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export interface DeleteDonationProgramState {
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

interface ParsedDonationProgramInput {
  name: string;
  slug: string;
  shortDescription: string | null;
  content: string | null;
  donationInstructions: string | null;
  coverImageId: string | null;
  displayOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
}

function parseDonationProgramForm(formData: FormData): ParsedDonationProgramInput | { error: string } {
  const name = readOptionalString(formData, "name");
  if (!name) {
    return { error: "Please fill in the following required field: Name." };
  }

  const displayOrderRaw = formData.get("displayOrder");
  const displayOrderText = typeof displayOrderRaw === "string" ? displayOrderRaw.trim() : "";
  if (!displayOrderText) {
    return { error: "Please fill in the following required field: Display Order." };
  }

  const displayOrder = Number(displayOrderText);
  if (!Number.isInteger(displayOrder)) {
    return { error: "Display Order must be a valid integer." };
  }

  const slugInput = readOptionalString(formData, "slug");
  const slug = slugify(slugInput ?? name);
  if (!slug) {
    return { error: "Slug must contain at least one letter or number." };
  }

  return {
    name,
    slug,
    shortDescription: readOptionalString(formData, "shortDescription"),
    content: readOptionalString(formData, "content"),
    donationInstructions: readOptionalString(formData, "donationInstructions"),
    coverImageId: readOptionalString(formData, "coverImageId"),
    displayOrder,
    isFeatured: formData.get("isFeatured") !== null,
    isPublished: formData.get("isPublished") !== null,
  };
}

/** Confirms `coverImageId`, when provided, refers to a real Media record. */
async function validateCoverImage(coverImageId: string | null): Promise<string | null> {
  if (!coverImageId) {
    return null;
  }
  const media = await prisma.media.findUnique({ where: { id: coverImageId } });
  return media ? null : "Selected cover image does not exist.";
}

/** Creates a new DonationProgram. `createdById`/`updatedById` are always the current session's user — never client-supplied. */
export async function createDonationProgram(
  _prevState: DonationProgramActionState,
  formData: FormData
): Promise<DonationProgramActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage donation programs." };
  }

  const parsed = parseDonationProgramForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const coverImageError = await validateCoverImage(parsed.coverImageId);
  if (coverImageError) {
    return { status: "error", message: coverImageError };
  }

  const [nameTaken, slugTaken] = await Promise.all([
    prisma.donationProgram.findUnique({ where: { name: parsed.name } }),
    prisma.donationProgram.findUnique({ where: { slug: parsed.slug } }),
  ]);

  if (nameTaken) {
    return { status: "error", message: `A donation program named "${parsed.name}" already exists.` };
  }

  if (slugTaken) {
    return {
      status: "error",
      message: `The slug "${parsed.slug}" is already in use. Try a different name or provide a custom slug.`,
    };
  }

  const isPublished = parsed.isPublished;
  const publishedAt = isPublished ? new Date() : null;

  try {
    await prisma.donationProgram.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        shortDescription: parsed.shortDescription,
        content: parsed.content,
        donationInstructions: parsed.donationInstructions,
        coverImageId: parsed.coverImageId,
        displayOrder: parsed.displayOrder,
        isFeatured: parsed.isFeatured,
        isPublished,
        publishedAt,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That name or slug is already in use by another donation program." };
    }
    console.error("Failed to create donation program:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/donations");
  redirect("/admin/donations");
}

/** Updates an existing DonationProgram by id. `updatedById` is always the current session's user. */
export async function updateDonationProgram(
  _prevState: DonationProgramActionState,
  formData: FormData
): Promise<DonationProgramActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage donation programs." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing donation program id." };
  }

  const existing = await prisma.donationProgram.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This donation program no longer exists. Please reload the page." };
  }

  const parsed = parseDonationProgramForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const coverImageError = await validateCoverImage(parsed.coverImageId);
  if (coverImageError) {
    return { status: "error", message: coverImageError };
  }

  const conflict = await prisma.donationProgram.findFirst({
    where: { id: { not: id }, OR: [{ name: parsed.name }, { slug: parsed.slug }] },
  });

  if (conflict) {
    const field = conflict.name === parsed.name ? "name" : "slug";
    return { status: "error", message: `Another donation program already uses that ${field}.` };
  }

  // Only stamp publishedAt on the unpublished -> published transition;
  // clear it on unpublish; leave it untouched while staying published.
  const isPublished = parsed.isPublished;
  const publishedAt = !isPublished ? null : existing.isPublished ? existing.publishedAt : new Date();

  try {
    await prisma.donationProgram.update({
      where: { id },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        shortDescription: parsed.shortDescription,
        content: parsed.content,
        donationInstructions: parsed.donationInstructions,
        coverImageId: parsed.coverImageId,
        displayOrder: parsed.displayOrder,
        isFeatured: parsed.isFeatured,
        isPublished,
        publishedAt,
        updatedById: session.user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That name or slug is already in use by another donation program." };
    }
    console.error("Failed to update donation program:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/donations");
  revalidatePath(`/admin/donations/${id}/edit`);
  redirect("/admin/donations");
}

/**
 * Flips `isPublished`, keeping `publishedAt` consistent: set to now when
 * publishing, cleared when unpublishing. Bound with
 * `.bind(null, id, nextIsPublished)` from a plain Server Component form.
 */
export async function toggleDonationProgramPublished(id: string, nextIsPublished: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.donationProgram.update({
    where: { id },
    data: {
      isPublished: nextIsPublished,
      publishedAt: nextIsPublished ? new Date() : null,
      updatedById: session.user.id,
    },
  });

  revalidatePath("/admin/donations");
}

/** Flips `isFeatured`. Bound with `.bind(null, id, nextIsFeatured)`. No maximum-featured-count is enforced — plain boolean. */
export async function toggleDonationProgramFeatured(id: string, nextIsFeatured: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.donationProgram.update({
    where: { id },
    data: { isFeatured: nextIsFeatured, updatedById: session.user.id },
  });

  revalidatePath("/admin/donations");
}

/** Deletes a DonationProgram. Never touches its cover Media — there are no other records that reference a DonationProgram. */
export async function deleteDonationProgram(
  _prevState: DeleteDonationProgramState,
  formData: FormData
): Promise<DeleteDonationProgramState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage donation programs." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing donation program id." };
  }

  const existing = await prisma.donationProgram.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This donation program no longer exists. Please reload the page." };
  }

  try {
    await prisma.donationProgram.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete donation program:", error);
    return { status: "error", message: "Something went wrong while deleting. Please try again." };
  }

  revalidatePath("/admin/donations");

  // The row disappears from the revalidated list on success — nothing left
  // on the page to attach a success message to.
  return { status: "idle", message: "" };
}
