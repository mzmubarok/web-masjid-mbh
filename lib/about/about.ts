import { prisma } from "@/lib/prisma";

/**
 * Returns the About record the admin manages and the public homepage will
 * read: the published one if one exists, otherwise the most recently edited
 * draft. The schema supports multiple About rows (drafts), but this app only
 * needs to manage one at a time — same convention as `getCurrentHero`.
 */
export async function getCurrentAbout() {
  const published = await prisma.about.findFirst({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  if (published) {
    return published;
  }

  return prisma.about.findFirst({
    orderBy: { updatedAt: "desc" },
  });
}
