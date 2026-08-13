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
