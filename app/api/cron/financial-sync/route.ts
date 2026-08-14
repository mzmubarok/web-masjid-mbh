import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { recordFinancialSheetSync } from "@/lib/finance/sync-monitoring";
import { getFinancialSyncEnvStatus } from "@/lib/finance/env-status";

/**
 * Scheduled entry point for the daily financial report sync (see
 * vercel.json for the schedule). This route never re-implements the
 * fetch/parse/upsert logic — it goes through the exact same
 * `recordFinancialSheetSync` wrapper the manual "Sync from Spreadsheet"
 * admin button already calls (see app/admin/finance/reports/action.ts),
 * which also stops this run from overlapping with a manual one.
 *
 * Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically
 * once CRON_SECRET is set on the project — this route only checks for that
 * exact header, it never trusts an unauthenticated caller.
 */
export async function GET(request: Request): Promise<NextResponse> {
  if (!getFinancialSyncEnvStatus().cronSecretConfigured) {
    console.error("Financial sync cron: CRON_SECRET is not configured.");
    return NextResponse.json({ error: "Automatic sync is not set up yet." }, { status: 500 });
  }

  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // A scheduled run has no signed-in admin to attribute the sync to, but
  // syncFinancialReports requires a real User id (createdById/
  // updatedById are non-nullable) — the same requirement the manual button
  // satisfies with the clicking admin's session. The longest-standing Super
  // Admin stands in here; this never changes what the sync function itself
  // needs or does.
  const actor = await prisma.user.findFirst({
    where: { role: { name: "Super Admin" } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!actor) {
    console.error("Financial sync cron: no Super Admin user found to attribute the sync to.");
    return NextResponse.json({ error: "No Super Admin user found." }, { status: 500 });
  }

  const outcome = await recordFinancialSheetSync(actor.id, "cron");

  if (outcome.alreadyRunning) {
    return NextResponse.json({ status: "skipped", reason: "A sync is already in progress." }, { status: 409 });
  }

  if (outcome.fetchError) {
    return NextResponse.json({ status: "error", ...outcome }, { status: 502 });
  }

  // Same convention as every mutating Financial admin action — the public
  // homepage reads FinancialReport (see app/page.tsx).
  revalidatePath("/");

  return NextResponse.json({ status: "ok", ...outcome });
}
