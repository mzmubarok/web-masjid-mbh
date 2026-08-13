import { prisma } from "@/lib/prisma";

/** The singleton ContactLocation record — at most one should ever exist. Returns null until the settings form is saved for the first time. */
export async function getContactLocation() {
  return prisma.contactLocation.findFirst();
}
