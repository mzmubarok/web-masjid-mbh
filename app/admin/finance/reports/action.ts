"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { recordFinancialSheetSync } from "@/lib/finance/sync-monitoring";
import { formatReportPeriod } from "@/lib/finance/format-finance";

export interface FinancialReportActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export interface DeleteFinancialReportState {
  status: "idle" | "error";
  message: string;
}

export interface SyncFinancialReportsState {
  status: "idle" | "success" | "error";
  message: string;
  created?: number;
  updated?: number;
  skipped?: number;
  durationMs?: number;
  /** Pre-formatted, e.g. "Agustus 2026" — matches lib/finance/format-finance.ts's existing convention; never a raw month/year pair crossing into the Client Component. */
  latestPeriod?: string;
}

const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/** True when `error` is a Prisma unique-constraint violation (P2002). */
function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Reads a required Decimal-field input as a validated numeric string — Prisma accepts a plain string for Decimal fields directly. */
function parseDecimalField(formData: FormData, key: string, label: string): string | { error: string } {
  const raw = formData.get(key);
  const text = typeof raw === "string" ? raw.trim() : "";

  if (!text) {
    return { error: `Please fill in the following required field: ${label}.` };
  }

  if (!DECIMAL_PATTERN.test(text)) {
    return { error: `${label} must be a valid number.` };
  }

  return text;
}

interface ParsedReportInput {
  programId: string;
  reportMonth: number;
  reportYear: number;
  totalFund: string;
  monthlyIncome: string;
  monthlyExpense: string;
  currentBalance: string;
  spreadsheetUrl: string | null;
  viewerUrl: string | null;
  notes: string | null;
  isPublished: boolean;
}

function parseReportForm(formData: FormData): ParsedReportInput | { error: string } {
  const programId = readOptionalString(formData, "programId");
  if (!programId) {
    return { error: "Please fill in the following required field: Program." };
  }

  const monthRaw = formData.get("reportMonth");
  const monthText = typeof monthRaw === "string" ? monthRaw.trim() : "";
  if (!monthText) {
    return { error: "Please fill in the following required field: Month." };
  }
  const reportMonth = Number(monthText);
  if (!Number.isInteger(reportMonth) || reportMonth < 1 || reportMonth > 12) {
    return { error: "Month must be between 1 and 12." };
  }

  const yearRaw = formData.get("reportYear");
  const yearText = typeof yearRaw === "string" ? yearRaw.trim() : "";
  if (!yearText) {
    return { error: "Please fill in the following required field: Year." };
  }
  const reportYear = Number(yearText);
  if (!Number.isInteger(reportYear) || reportYear < MIN_YEAR || reportYear > MAX_YEAR) {
    return { error: `Year must be a valid year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }

  const totalFund = parseDecimalField(formData, "totalFund", "Total Fund");
  if (typeof totalFund !== "string") {
    return totalFund;
  }

  const monthlyIncome = parseDecimalField(formData, "monthlyIncome", "Monthly Income");
  if (typeof monthlyIncome !== "string") {
    return monthlyIncome;
  }

  const monthlyExpense = parseDecimalField(formData, "monthlyExpense", "Monthly Expense");
  if (typeof monthlyExpense !== "string") {
    return monthlyExpense;
  }

  const currentBalance = parseDecimalField(formData, "currentBalance", "Current Balance");
  if (typeof currentBalance !== "string") {
    return currentBalance;
  }

  return {
    programId,
    reportMonth,
    reportYear,
    totalFund,
    monthlyIncome,
    monthlyExpense,
    currentBalance,
    spreadsheetUrl: readOptionalString(formData, "spreadsheetUrl"),
    viewerUrl: readOptionalString(formData, "viewerUrl"),
    notes: readOptionalString(formData, "notes"),
    isPublished: formData.get("isPublished") !== null,
  };
}

/** Confirms `programId` refers to a real program that's either active or already this report's own program. */
async function validateProgram(programId: string, currentProgramId?: string): Promise<string | null> {
  const program = await prisma.financialProgram.findUnique({ where: { id: programId } });

  if (!program) {
    return "Selected financial program does not exist.";
  }

  if (!program.isActive && programId !== currentProgramId) {
    return "Selected financial program is not active.";
  }

  return null;
}

/** Creates a new FinancialReport. `createdById`/`updatedById` are always the current session's user — never client-supplied. `dataSource` is left at its schema default ("manual") and is never set here. */
export async function createFinancialReport(
  _prevState: FinancialReportActionState,
  formData: FormData
): Promise<FinancialReportActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage financial reports." };
  }

  const parsed = parseReportForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const programError = await validateProgram(parsed.programId);
  if (programError) {
    return { status: "error", message: programError };
  }

  const conflict = await prisma.financialReport.findUnique({
    where: {
      programId_reportMonth_reportYear: {
        programId: parsed.programId,
        reportMonth: parsed.reportMonth,
        reportYear: parsed.reportYear,
      },
    },
  });
  if (conflict) {
    return {
      status: "error",
      message: `A report for ${parsed.reportMonth}/${parsed.reportYear} already exists for this program.`,
    };
  }

  const isPublished = parsed.isPublished;
  const publishedAt = isPublished ? new Date() : null;

  try {
    await prisma.financialReport.create({
      data: {
        programId: parsed.programId,
        reportMonth: parsed.reportMonth,
        reportYear: parsed.reportYear,
        totalFund: parsed.totalFund,
        monthlyIncome: parsed.monthlyIncome,
        monthlyExpense: parsed.monthlyExpense,
        currentBalance: parsed.currentBalance,
        spreadsheetUrl: parsed.spreadsheetUrl,
        viewerUrl: parsed.viewerUrl,
        notes: parsed.notes,
        isPublished,
        publishedAt,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "A report for that program, month, and year already exists." };
    }
    console.error("Failed to create financial report:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/finance/reports");
  // The public homepage's Financial section reads each program's most recent
  // published report (see app/page.tsx) — same convention as
  // updateHero/updateAbout/createEvent.
  revalidatePath("/");
  redirect("/admin/finance/reports");
}

/** Updates an existing FinancialReport by id. `updatedById` is always the current session's user. */
export async function updateFinancialReport(
  _prevState: FinancialReportActionState,
  formData: FormData
): Promise<FinancialReportActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage financial reports." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing report id." };
  }

  const existing = await prisma.financialReport.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This report no longer exists. Please reload the page." };
  }

  const parsed = parseReportForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const programError = await validateProgram(parsed.programId, existing.programId);
  if (programError) {
    return { status: "error", message: programError };
  }

  const conflict = await prisma.financialReport.findFirst({
    where: {
      id: { not: id },
      programId: parsed.programId,
      reportMonth: parsed.reportMonth,
      reportYear: parsed.reportYear,
    },
  });
  if (conflict) {
    return {
      status: "error",
      message: `Another report for ${parsed.reportMonth}/${parsed.reportYear} already exists for this program.`,
    };
  }

  // Only stamp publishedAt on the unpublished -> published transition;
  // clear it on unpublish; leave it untouched while staying published.
  const isPublished = parsed.isPublished;
  const publishedAt = !isPublished ? null : existing.isPublished ? existing.publishedAt : new Date();

  try {
    await prisma.financialReport.update({
      where: { id },
      data: {
        programId: parsed.programId,
        reportMonth: parsed.reportMonth,
        reportYear: parsed.reportYear,
        totalFund: parsed.totalFund,
        monthlyIncome: parsed.monthlyIncome,
        monthlyExpense: parsed.monthlyExpense,
        currentBalance: parsed.currentBalance,
        spreadsheetUrl: parsed.spreadsheetUrl,
        viewerUrl: parsed.viewerUrl,
        notes: parsed.notes,
        isPublished,
        publishedAt,
        updatedById: session.user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "A report for that program, month, and year already exists." };
    }
    console.error("Failed to update financial report:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/finance/reports");
  revalidatePath(`/admin/finance/reports/${id}/edit`);
  revalidatePath("/");
  redirect("/admin/finance/reports");
}

/**
 * Flips `isPublished`, keeping `publishedAt` consistent: set to now when
 * publishing, cleared when unpublishing. Bound with
 * `.bind(null, id, nextIsPublished)` from a plain Server Component form.
 */
export async function toggleFinancialReportPublished(id: string, nextIsPublished: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.financialReport.update({
    where: { id },
    data: {
      isPublished: nextIsPublished,
      publishedAt: nextIsPublished ? new Date() : null,
      updatedById: session.user.id,
    },
  });

  revalidatePath("/admin/finance/reports");
  revalidatePath("/");
}

/** Deletes a FinancialReport. Never touches its FinancialProgram or any Media. */
export async function deleteFinancialReport(
  _prevState: DeleteFinancialReportState,
  formData: FormData
): Promise<DeleteFinancialReportState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage financial reports." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing report id." };
  }

  const existing = await prisma.financialReport.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This report no longer exists. Please reload the page." };
  }

  try {
    await prisma.financialReport.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete financial report:", error);
    return { status: "error", message: "Something went wrong while deleting. Please try again." };
  }

  revalidatePath("/admin/finance/reports");
  revalidatePath("/");

  // The row disappears from the revalidated list on success — nothing left
  // on the page to attach a success message to.
  return { status: "idle", message: "" };
}

/**
 * Manually triggers the same import the daily cron uses — see
 * `lib/finance/sheet-sync.ts` for the actual fetch/parse/upsert logic and
 * `lib/finance/sync-monitoring.ts` for the history/lock wrapper this action
 * calls. Neither is duplicated here. The signed-in admin is passed through
 * as `actorUserId`; the cron route supplies its own actor instead.
 */
export async function syncFinancialReportsFromSheetAction(
  // Required by useActionState's (state, formData) calling convention —
  // this action takes no input, it's a plain trigger.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: SyncFinancialReportsState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<SyncFinancialReportsState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to sync financial reports." };
  }

  const outcome = await recordFinancialSheetSync(session.user.id, "manual");

  if (outcome.alreadyRunning) {
    return { status: "error", message: "A sync is already in progress. Please wait for it to finish." };
  }

  revalidatePath("/admin/finance/reports");
  revalidatePath("/admin/finance");

  if (outcome.fetchError) {
    return { status: "error", message: outcome.fetchError };
  }

  // The public homepage's Financial section reads FinancialReport rows
  // (see app/page.tsx) — same convention as every other mutating action.
  revalidatePath("/");

  const skippedSummary =
    outcome.skipped.length > 0
      ? `${outcome.skipped.length} row(s) skipped: ${outcome.skipped
          .slice(0, 3)
          // Each `reason` already ends with its own period — no extra one appended here.
          .map((row) => `Row ${row.row}: ${row.reason}`)
          .join(" ")}${outcome.skipped.length > 3 ? ` And ${outcome.skipped.length - 3} more.` : ""}`
      : "";

  return {
    status: "success",
    // Only the skip-detail text — the "Sync completed successfully."
    // headline is rendered by SyncFinancialReportsButton itself, not
    // duplicated into this string.
    message: skippedSummary,
    created: outcome.created,
    updated: outcome.updated,
    skipped: outcome.skipped.length,
    durationMs: outcome.durationMs,
    latestPeriod: outcome.latestPeriod
      ? formatReportPeriod(outcome.latestPeriod.month, outcome.latestPeriod.year)
      : undefined,
  };
}
