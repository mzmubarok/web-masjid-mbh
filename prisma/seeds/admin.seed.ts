import { hash } from "bcryptjs";

import { PrismaClient } from "@/lib/generated/prisma/client";

const ADMIN_NAME = "Super Admin";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "baitul123";

export async function seedAdmin(prisma: PrismaClient) {
  console.log("👤 Seeding admin...");

  const superAdminRole = await prisma.role.findUnique({
    where: {
      name: "Super Admin",
    },
  });

  if (!superAdminRole) {
    throw new Error(
      "Role 'Super Admin' not found. Please run role seed first."
    );
  }

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: ADMIN_EMAIL,
    },
  });

  if (existingAdmin) {
    console.log("ℹ️ Admin already exists.");
    return;
  }

  const passwordHash = await hash(ADMIN_PASSWORD, 12);

  await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      roleId: superAdminRole.id,
    },
  });

  console.log("✅ Admin seeded.");
}