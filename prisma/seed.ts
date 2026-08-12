import { prisma } from "@/lib/prisma";
import { seedRoles } from "./seeds/role.seed";

async function main() {
  console.log("🌱 Starting database seed...");

  await seedRoles(prisma);

  console.log("✅ Database seed completed.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });