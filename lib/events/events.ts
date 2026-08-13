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
