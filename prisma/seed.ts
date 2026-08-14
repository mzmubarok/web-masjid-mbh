import { prisma } from "@/lib/prisma";

import { seedRoles } from "./seeds/role.seed";
import { seedAdmin } from "./seeds/admin.seed";
import { seedSiteSetting } from "./seeds/site-setting.seed";
import { seedPrayerSetting } from "./seeds/prayer-setting.seed";

async function main() {
  console.log("🌱 Starting database seed...");

  await seedRoles(prisma);
  await seedAdmin(prisma);
  await seedSiteSetting(prisma);
  await seedPrayerSetting(prisma);

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