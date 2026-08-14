import { prisma } from "@/lib/prisma";

/** All embed posts for one SocialMedia platform, admin-ordered by displayOrder. */
export async function getSocialMediaPostsBySocialMediaId(socialMediaId: string) {
  return prisma.socialMediaPost.findMany({
    where: { socialMediaId },
    orderBy: { displayOrder: "asc" },
  });
}
