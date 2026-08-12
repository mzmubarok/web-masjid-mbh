import type { PrismaClient } from "@/lib/generated/prisma/client";

export async function seedRoles(prisma: PrismaClient) {
  console.log("🌱 Seeding roles...");

  const roles = [
    {
      name: "Super Admin",
      description: "Has full access to all system features.",
    },
    {
      name: "Admin",
      description: "Can manage website content.",
    },
    {
      name: "Editor",
      description: "Can create and edit content.",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {
        description: role.description,
      },
      create: role,
    });
  }

  console.log("✅ Roles seeded.");
}