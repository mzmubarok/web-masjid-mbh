import { prisma } from "@/lib/prisma";

/**
 * Returns the Hero record the admin manages and the public homepage will
 * read: the published one if one exists, otherwise the most recently edited
 * draft. The schema supports multiple Hero rows (drafts), but this app only
 * needs to manage one at a time — the section shown, or about to be shown,
 * on the homepage.
 */
export async function getCurrentHero() {
  const published = await prisma.hero.findFirst({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: { backgroundImage: true },
  });

  if (published) {
    return published;
  }

  return prisma.hero.findFirst({
    orderBy: { updatedAt: "desc" },
    include: { backgroundImage: true },
  });
}
