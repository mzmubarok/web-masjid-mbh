import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Health check — confirms the Prisma singleton can actually reach the database. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "Database Connected" });
  } catch {
    return NextResponse.json({ status: "Database Error" }, { status: 500 });
  }
}
