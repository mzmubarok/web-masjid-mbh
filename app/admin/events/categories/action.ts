"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export interface CategoryActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export interface DeleteCategoryState {
  status: "idle" | "error";
  message: string;
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/**
 * Small local slug normalizer — lowercase, ASCII, hyphen-separated. No
 * slug utility exists elsewhere in the project and this doesn't warrant a
 * dependency.
 */
function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents (e.g. e-with-acute -> e)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ParsedCategoryInput {
  name: string;
  slug: string;
  color: string | null;
  sortOrder: number;
}

function parseCategoryForm(formData: FormData): ParsedCategoryInput | { error: string } {
  const name = readOptionalString(formData, "name");
  if (!name) {
    return { error: "Please fill in the following required field: Name." };
  }

  const sortOrderRaw = formData.get("sortOrder");
  const sortOrderText = typeof sortOrderRaw === "string" ? sortOrderRaw.trim() : "";
  if (!sortOrderText) {
    return { error: "Please fill in the following required field: Sort Order." };
  }

  const sortOrder = Number(sortOrderText);
  if (!Number.isInteger(sortOrder)) {
    return { error: "Sort Order must be a valid integer." };
  }

  const slugInput = readOptionalString(formData, "slug");
  const slug = slugify(slugInput ?? name);
  if (!slug) {
    return { error: "Slug must contain at least one letter or number." };
  }

  const color = readOptionalString(formData, "color");

  return { name, slug, color, sortOrder };
}

/** True when `error` is a Prisma unique-constraint violation (P2002). */
function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Creates a new EventCategory. `isActive` always starts `true`, per the schema default. */
export async function createEventCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage event categories." };
  }

  const parsed = parseCategoryForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const { name, slug, color, sortOrder } = parsed;

  const [nameTaken, slugTaken] = await Promise.all([
    prisma.eventCategory.findUnique({ where: { name } }),
    prisma.eventCategory.findUnique({ where: { slug } }),
  ]);

  if (nameTaken) {
    return { status: "error", message: `A category named "${name}" already exists.` };
  }

  if (slugTaken) {
    return {
      status: "error",
      message: `The slug "${slug}" is already in use. Try a different name or provide a custom slug.`,
    };
  }

  try {
    await prisma.eventCategory.create({
      data: { name, slug, color, sortOrder },
    });
  } catch (error) {
    // Defense in depth against the pre-checks above racing a concurrent
    // write — the checks give a precise message; this catches what slips
    // through instead of leaking a raw constraint error.
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That name or slug is already in use by another category." };
    }
    console.error("Failed to create event category:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/events/categories");

  return { status: "success", message: `Category "${name}" created.` };
}

/** Updates an existing EventCategory's name/slug/color/sortOrder. Active status is toggled separately. */
export async function updateEventCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage event categories." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing category id." };
  }

  const existing = await prisma.eventCategory.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This category no longer exists. Please reload the page." };
  }

  const parsed = parseCategoryForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const { name, slug, color, sortOrder } = parsed;

  const conflict = await prisma.eventCategory.findFirst({
    where: { id: { not: id }, OR: [{ name }, { slug }] },
  });

  if (conflict) {
    const field = conflict.name === name ? "name" : "slug";
    return { status: "error", message: `Another category already uses that ${field}.` };
  }

  try {
    await prisma.eventCategory.update({
      where: { id },
      data: { name, slug, color, sortOrder },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That name or slug is already in use by another category." };
    }
    console.error("Failed to update event category:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/events/categories");
  revalidatePath(`/admin/events/categories/${id}/edit`);

  return { status: "success", message: `Category "${name}" updated.` };
}

/**
 * Flips `isActive`. Bound with `.bind(null, id, nextIsActive)` from a plain
 * Server Component form — deactivating never deletes the category.
 */
export async function toggleEventCategoryActive(id: string, nextIsActive: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.eventCategory.update({
    where: { id },
    data: { isActive: nextIsActive },
  });

  revalidatePath("/admin/events/categories");
}

/**
 * Deletes an EventCategory only when no Event references it — `Event.categoryId`
 * is required, so deleting a referenced category would either fail at the
 * database level or (worse) orphan events. Deactivating is the recommended
 * alternative and is surfaced in the returned message.
 */
export async function deleteEventCategory(
  _prevState: DeleteCategoryState,
  formData: FormData
): Promise<DeleteCategoryState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage event categories." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing category id." };
  }

  const eventCount = await prisma.event.count({ where: { categoryId: id } });

  if (eventCount > 0) {
    return {
      status: "error",
      message: `This category is used by ${eventCount} event${eventCount === 1 ? "" : "s"} and can't be deleted. Deactivate it instead.`,
    };
  }

  try {
    await prisma.eventCategory.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete event category:", error);
    return { status: "error", message: "Something went wrong while deleting. Please try again." };
  }

  revalidatePath("/admin/events/categories");

  // The row disappears from the revalidated list on success — nothing left
  // on the page to attach a success message to.
  return { status: "idle", message: "" };
}
