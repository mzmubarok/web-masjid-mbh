"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { slugify } from "@/lib/slug";

export interface FinancialProgramActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export interface DeleteFinancialProgramState {
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

interface ParsedProgramInput {
  name: string;
  slug: string;
  description: string | null;
  iconId: string | null;
  color: string | null;
  displayOrder: number;
}

function parseProgramForm(formData: FormData): ParsedProgramInput | { error: string } {
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
    description: readOptionalString(formData, "description"),
    iconId: readOptionalString(formData, "iconId"),
    color: readOptionalString(formData, "color"),
    displayOrder,
  };
}

/** Confirms `iconId`, when provided, refers to a real Media record. */
async function validateIcon(iconId: string | null): Promise<string | null> {
  if (!iconId) {
    return null;
  }
  const media = await prisma.media.findUnique({ where: { id: iconId } });
  return media ? null : "Selected icon does not exist.";
}

/** Creates a new FinancialProgram. `isActive`/`showOnHomepage` always start `true`, per the schema defaults. */
export async function createFinancialProgram(
  _prevState: FinancialProgramActionState,
  formData: FormData
): Promise<FinancialProgramActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage financial programs." };
  }

  const parsed = parseProgramForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const iconError = await validateIcon(parsed.iconId);
  if (iconError) {
    return { status: "error", message: iconError };
  }

  const [nameTaken, slugTaken] = await Promise.all([
    prisma.financialProgram.findUnique({ where: { name: parsed.name } }),
    prisma.financialProgram.findUnique({ where: { slug: parsed.slug } }),
  ]);

  if (nameTaken) {
    return { status: "error", message: `A financial program named "${parsed.name}" already exists.` };
  }

  if (slugTaken) {
    return {
      status: "error",
      message: `The slug "${parsed.slug}" is already in use. Try a different name or provide a custom slug.`,
    };
  }

  try {
    await prisma.financialProgram.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        iconId: parsed.iconId,
        color: parsed.color,
        displayOrder: parsed.displayOrder,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That name or slug is already in use by another financial program." };
    }
    console.error("Failed to create financial program:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/finance");
  // The public homepage's Financial section reads active, homepage-visible
  // programs (see app/page.tsx) — same convention as updateHero/updateAbout/createEvent.
  revalidatePath("/");
  redirect("/admin/finance");
}

/** Updates an existing FinancialProgram's core fields. Active/homepage status are toggled separately. */
export async function updateFinancialProgram(
  _prevState: FinancialProgramActionState,
  formData: FormData
): Promise<FinancialProgramActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage financial programs." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing financial program id." };
  }

  const existing = await prisma.financialProgram.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This financial program no longer exists. Please reload the page." };
  }

  const parsed = parseProgramForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const iconError = await validateIcon(parsed.iconId);
  if (iconError) {
    return { status: "error", message: iconError };
  }

  const conflict = await prisma.financialProgram.findFirst({
    where: { id: { not: id }, OR: [{ name: parsed.name }, { slug: parsed.slug }] },
  });

  if (conflict) {
    const field = conflict.name === parsed.name ? "name" : "slug";
    return { status: "error", message: `Another financial program already uses that ${field}.` };
  }

  try {
    await prisma.financialProgram.update({
      where: { id },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        iconId: parsed.iconId,
        color: parsed.color,
        displayOrder: parsed.displayOrder,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That name or slug is already in use by another financial program." };
    }
    console.error("Failed to update financial program:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/finance");
  revalidatePath(`/admin/finance/${id}/edit`);
  revalidatePath("/");
  redirect("/admin/finance");
}

/**
 * Flips `isActive`. Bound with `.bind(null, id, nextIsActive)` from a plain
 * Server Component form — deactivating never deletes the program.
 */
export async function toggleFinancialProgramActive(id: string, nextIsActive: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.financialProgram.update({
    where: { id },
    data: { isActive: nextIsActive },
  });

  revalidatePath("/admin/finance");
  revalidatePath("/");
}

/** Flips `showOnHomepage`. Bound with `.bind(null, id, nextShowOnHomepage)`. */
export async function toggleFinancialProgramShowOnHomepage(id: string, nextShowOnHomepage: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.financialProgram.update({
    where: { id },
    data: { showOnHomepage: nextShowOnHomepage },
  });

  revalidatePath("/admin/finance");
  revalidatePath("/");
}

/**
 * Deletes a FinancialProgram only when no FinancialReport references it —
 * `FinancialReport.programId` is required, so deleting a referenced program
 * would either fail at the database level or orphan reports. Deactivating is
 * the recommended alternative and is surfaced in the returned message. Never
 * deletes reports or the program's icon Media.
 */
export async function deleteFinancialProgram(
  _prevState: DeleteFinancialProgramState,
  formData: FormData
): Promise<DeleteFinancialProgramState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage financial programs." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing financial program id." };
  }

  const reportCount = await prisma.financialReport.count({ where: { programId: id } });

  if (reportCount > 0) {
    return {
      status: "error",
      message: `This program is used by ${reportCount} report${reportCount === 1 ? "" : "s"} and can't be deleted. Deactivate it instead.`,
    };
  }

  try {
    await prisma.financialProgram.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete financial program:", error);
    return { status: "error", message: "Something went wrong while deleting. Please try again." };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/");

  // The row disappears from the revalidated list on success — nothing left
  // on the page to attach a success message to.
  return { status: "idle", message: "" };
}
