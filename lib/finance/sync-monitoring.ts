import { prisma } from "@/lib/prisma";
import { syncFinancialReports, type FinancialSheetSyncResult } from "@/lib/finance/sync";

// A "running" row older than this is treated as an abandoned/crashed sync,
// not one still genuinely in progress — otherwise a hard crash mid-sync
// (process killed before its `finally` could run) would permanently lock
// out every future sync. ponytail: a simple time-based staleness check, not
// a real lock; fine at this traffic level (one cron a day plus occasional
// manual clicks) — reach for an actual advisory lock only if concurrent
// syncs ever become a real possibility.
const STALE_RUN_MS = 5 * 60 * 1000;

export type FinancialSyncTrigger = "manual" | "cron";

export type FinancialSyncOutcome =
  | { alreadyRunning: true }
  | ({ alreadyRunning: false; durationMs: number } & FinancialSheetSyncResult);

/**
 * Wraps `syncFinancialReports` — never re-implements its
 * fetch/parse/upsert logic — with the monitoring this phase adds: a
 * `FinancialSyncRun` history row per attempt, and a simple check against any
 * still-running row so the manual button and the daily cron can never
 * execute a sync at the same time. Both call sites (the manual Server
 * Action and the cron route) go through this single function instead of
 * calling the sync service directly.
 */
export async function recordFinancialSheetSync(
  actorUserId: string,
  triggeredBy: FinancialSyncTrigger
): Promise<FinancialSyncOutcome> {
  const runningRun = await prisma.financialSyncRun.findFirst({
    where: { status: "running" },
    orderBy: { startedAt: "desc" },
  });

  if (runningRun && Date.now() - runningRun.startedAt.getTime() < STALE_RUN_MS) {
    return { alreadyRunning: true };
  }

  const run = await prisma.financialSyncRun.create({
    data: { status: "running", triggeredBy },
  });

  const startedAt = Date.now();

  try {
    const result = await syncFinancialReports(actorUserId);
    const durationMs = Date.now() - startedAt;

    await prisma.financialSyncRun.update({
      where: { id: run.id },
      data: {
        status: result.fetchError ? "error" : "success",
        created: result.created,
        updated: result.updated,
        skipped: result.skipped.length,
        errorMessage: result.fetchError ?? null,
        finishedAt: new Date(),
      },
    });

    return { alreadyRunning: false, durationMs, ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during sync.";
    await prisma.financialSyncRun.update({
      where: { id: run.id },
      data: { status: "error", errorMessage: message, finishedAt: new Date() },
    });

    return {
      alreadyRunning: false,
      durationMs: Date.now() - startedAt,
      created: 0,
      updated: 0,
      skipped: [],
      fetchError: message,
    };
  }
}

/** The most recent sync attempt, for the admin "Last Sync" status panel. `null` before any sync has ever run. */
export async function getLatestFinancialSyncRun() {
  return prisma.financialSyncRun.findFirst({ orderBy: { startedAt: "desc" } });
}

/** Recent sync attempts, newest first, for the admin sync history list. */
export async function getFinancialSyncHistory(limit = 10) {
  return prisma.financialSyncRun.findMany({ orderBy: { startedAt: "desc" }, take: limit });
}
