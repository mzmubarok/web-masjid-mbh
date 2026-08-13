"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { slugify } from "@/lib/slug";
import { parseDateOnly } from "@/lib/date";

export interface EventActionState {
  status: "idle" | "success" | "error";
  message: string;
}

const TIME_PATTERN = /^\d{2}:\d{2}$/;

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/** True when `error` is a Prisma unique-constraint violation (P2002). */
function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

interface ParsedEventInput {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  categoryId: string;
  location: string;
  startDate: Date;
  endDate: Date | null;
  startTime: string;
  endTime: string | null;
  isFeatured: boolean;
  isPublished: boolean;
}

function parseEventForm(formData: FormData): ParsedEventInput | { error: string } {
  const requiredFields: [string, string][] = [
    ["title", "Title"],
    ["excerpt", "Excerpt"],
    ["description", "Description"],
    ["categoryId", "Category"],
    ["location", "Location"],
  ];

  const missing: string[] = [];
  const values: Record<string, string> = {};

  for (const [key, label] of requiredFields) {
    const value = readOptionalString(formData, key);
    if (!value) {
      missing.push(label);
    } else {
      values[key] = value;
    }
  }

  const startDateText = readOptionalString(formData, "startDate");
  if (!startDateText) {
    missing.push("Start Date");
  }

  const startTimeText = readOptionalString(formData, "startTime");
  if (!startTimeText) {
    missing.push("Start Time");
  }

  if (missing.length > 0) {
    return { error: `Please fill in the following required fields: ${missing.join(", ")}.` };
  }

  const startDate = parseDateOnly(startDateText!);
  if (!startDate) {
    return { error: "Start Date is not a valid date." };
  }

  if (!TIME_PATTERN.test(startTimeText!)) {
    return { error: "Start Time is not a valid time." };
  }

  const endDateText = readOptionalString(formData, "endDate");
  let endDate: Date | null = null;
  if (endDateText) {
    endDate = parseDateOnly(endDateText);
    if (!endDate) {
      return { error: "End Date is not a valid date." };
    }
  }

  const endTimeText = readOptionalString(formData, "endTime");
  if (endTimeText && !TIME_PATTERN.test(endTimeText)) {
    return { error: "End Time is not a valid time." };
  }

  if (endDate && endDate.getTime() < startDate.getTime()) {
    return { error: "End Date cannot be before the Start Date." };
  }

  if (endDate && endTimeText && endDate.getTime() === startDate.getTime() && endTimeText <= startTimeText!) {
    return { error: "End Time must be after Start Time when End Date is the same day." };
  }

  const slugInput = readOptionalString(formData, "slug");
  const slug = slugify(slugInput ?? values.title);
  if (!slug) {
    return { error: "Slug must contain at least one letter or number." };
  }

  return {
    title: values.title,
    slug,
    excerpt: values.excerpt,
    description: values.description,
    categoryId: values.categoryId,
    location: values.location,
    startDate,
    endDate,
    startTime: startTimeText!,
    endTime: endTimeText,
    isFeatured: formData.get("isFeatured") !== null,
    isPublished: formData.get("isPublished") !== null,
  };
}

/** Confirms `categoryId` refers to a real category that's either active or already this Event's own category. */
async function validateCategory(categoryId: string, currentCategoryId?: string): Promise<string | null> {
  const category = await prisma.eventCategory.findUnique({ where: { id: categoryId } });

  if (!category) {
    return "Selected category does not exist.";
  }

  if (!category.isActive && categoryId !== currentCategoryId) {
    return "Selected category is not active.";
  }

  return null;
}

/** Creates a new Event. `createdById`/`updatedById` are always the current session's user — never client-supplied. */
export async function createEvent(
  _prevState: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage events." };
  }

  const parsed = parseEventForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const categoryError = await validateCategory(parsed.categoryId);
  if (categoryError) {
    return { status: "error", message: categoryError };
  }

  const slugTaken = await prisma.event.findUnique({ where: { slug: parsed.slug } });
  if (slugTaken) {
    return {
      status: "error",
      message: `The slug "${parsed.slug}" is already in use. Try a different title or provide a custom slug.`,
    };
  }

  const isPublished = parsed.isPublished;
  const publishedAt = isPublished ? new Date() : null;

  try {
    await prisma.event.create({
      data: {
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt,
        description: parsed.description,
        categoryId: parsed.categoryId,
        location: parsed.location,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        isFeatured: parsed.isFeatured,
        isPublished,
        publishedAt,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That slug is already in use by another event." };
    }
    console.error("Failed to create event:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

/** Updates an existing Event by id. `updatedById` is always the current session's user. */
export async function updateEvent(
  _prevState: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage events." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing event id." };
  }

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This event no longer exists. Please reload the page." };
  }

  const parsed = parseEventForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const categoryError = await validateCategory(parsed.categoryId, existing.categoryId);
  if (categoryError) {
    return { status: "error", message: categoryError };
  }

  const slugConflict = await prisma.event.findFirst({
    where: { id: { not: id }, slug: parsed.slug },
  });
  if (slugConflict) {
    return { status: "error", message: `The slug "${parsed.slug}" is already in use by another event.` };
  }

  // Only stamp publishedAt on the unpublished -> published transition;
  // clear it on unpublish; leave it untouched while staying published.
  const isPublished = parsed.isPublished;
  const publishedAt = !isPublished ? null : existing.isPublished ? existing.publishedAt : new Date();

  try {
    await prisma.event.update({
      where: { id },
      data: {
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt,
        description: parsed.description,
        categoryId: parsed.categoryId,
        location: parsed.location,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        isFeatured: parsed.isFeatured,
        isPublished,
        publishedAt,
        updatedById: session.user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That slug is already in use by another event." };
    }
    console.error("Failed to update event:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}/edit`);
  redirect("/admin/events");
}

/**
 * Flips `isPublished`, keeping `publishedAt` consistent: set to now when
 * publishing, cleared when unpublishing. Bound with
 * `.bind(null, id, nextIsPublished)` from a plain Server Component form.
 */
export async function toggleEventPublished(id: string, nextIsPublished: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.event.update({
    where: { id },
    data: {
      isPublished: nextIsPublished,
      publishedAt: nextIsPublished ? new Date() : null,
      updatedById: session.user.id,
    },
  });

  revalidatePath("/admin/events");
}

/** Flips `isFeatured`. Bound with `.bind(null, id, nextIsFeatured)`. No maximum-featured-count is enforced — plain boolean. */
export async function toggleEventFeatured(id: string, nextIsFeatured: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.event.update({
    where: { id },
    data: { isFeatured: nextIsFeatured, updatedById: session.user.id },
  });

  revalidatePath("/admin/events");
}
