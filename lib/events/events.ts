import { prisma } from "@/lib/prisma";

/** All events with their category, newest-dated first. Simple single-field sort by design. */
export async function getEvents() {
  return prisma.event.findMany({
    include: { category: true },
    orderBy: { startDate: "desc" },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({ where: { id } });
}

/**
 * Published, not-yet-past events for the public homepage teaser — soonest
 * first, featured events preferred among ties. `startDate` is stored as UTC
 * midnight of the picked calendar date (see lib/date.ts's `parseDateOnly`),
 * so "today" is computed the same way here for a consistent comparison.
 * Unlike `getEvents()` (admin, everything, newest-created first), this
 * never includes unpublished drafts or events already in the past.
 */
export async function getUpcomingEvents(limit = 3) {
  const now = new Date();
  const todayUTCMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  return prisma.event.findMany({
    where: {
      isPublished: true,
      startDate: { gte: todayUTCMidnight },
    },
    include: { category: true, featuredImage: true },
    orderBy: [{ isFeatured: "desc" }, { startDate: "asc" }],
    take: limit,
  });
}
