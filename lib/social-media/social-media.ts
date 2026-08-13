import { prisma } from "@/lib/prisma";

/** All social media links with their icon, sorted for display: displayOrder first, platform as a stable tie-breaker. */
export async function getSocialMediaList() {
  return prisma.socialMedia.findMany({
    include: { icon: true },
    orderBy: [{ displayOrder: "asc" }, { platform: "asc" }],
  });
}

export async function getSocialMediaById(id: string) {
  return prisma.socialMedia.findUnique({ where: { id } });
}
