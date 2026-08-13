import { prisma } from "@/lib/prisma";

/** All event categories, sorted for display: sortOrder first, name as a stable tie-breaker. */
export async function getEventCategories() {
  return prisma.eventCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getEventCategoryById(id: string) {
  return prisma.eventCategory.findUnique({ where: { id } });
}

/**
 * Categories selectable in an Event's category dropdown: active ones, plus
 * `currentCategoryId` even if it's since been deactivated — so editing an
 * existing Event never silently drops or reassigns its category just
 * because that category was deactivated after the fact.
 */
export async function getSelectableEventCategories(currentCategoryId?: string) {
  return prisma.eventCategory.findMany({
    where: currentCategoryId
      ? { OR: [{ isActive: true }, { id: currentCategoryId }] }
      : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
