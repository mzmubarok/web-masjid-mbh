import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Configure it in your environment (see .env for local development, or Vercel Project Settings for production)."
  );
}

// Pooled connection (e.g. Supabase's Supavisor/PgBouncer) — safe for a
// serverless runtime where many function instances may each hold a
// connection. Migrations use a separate, direct connection; see
// prisma.config.ts.
const adapter = new PrismaPg(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
