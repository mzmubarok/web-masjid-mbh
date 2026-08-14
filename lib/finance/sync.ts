import { prisma } from "@/lib/prisma";
import { downloadCsv } from "@/lib/finance/csv";

// Marks every report this sync writes, so a manually-entered report
// (`dataSource` stays at its schema default, "manual") is never confused
// with one that came from the spreadsheet.
const SYNC_DATA_SOURCE = "spreadsheet";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;
const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

// The spreadsheet (specifically its Public_Data worksheet — see
// docs/financial-sync.md §7) now does all calculation/aggregation itself
// and exports one row per FinancialReport already summarized. No section
// headers, no grouping — just these 8 columns.
const REQUIRED_COLUMNS = [
  "program_slug",
  "report_month",
  "report_year",
  "total_fund",
  "monthly_income",
  "monthly_expense",
  "current_balance",
] as const;

export interface FinancialSheetSyncSkippedRow {
  row: number;
  /** The row's own program_slug cell, when it had one — present even when that slug didn't match any program. */
  programSlug?: string;
  reason: string;
}

export interface FinancialSheetSyncResult {
  created: number;
  updated: number;
  skipped: FinancialSheetSyncSkippedRow[];
  /** Set when the sync couldn't run at all (missing config, network/HTTP failure, missing column) — `created`/`updated`/`skipped` are all 0 in that case. */
  fetchError?: string;
  /** The most recent (month, year) among the rows this run actually created or updated — omitted when nothing was written (e.g. every row was skipped). */
  latestPeriod?: { month: number; year: number };
}

function normalizeHeader(cell: string): string {
  return cell.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Row 0 is the header; every other non-blank row becomes a header-keyed
 * object. The sheet is already flat and normalized — one row is one
 * FinancialReport — so there's no section detection or grouping step here,
 * just this.
 */
function parseCsvRows(rawRows: string[][]): Record<string, string>[] {
  if (rawRows.length === 0) return [];
  const header = rawRows[0].map(normalizeHeader);
  return rawRows
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => Object.fromEntries(header.map((key, index) => [key, (row[index] ?? "").trim()])));
}

/** Which required columns are absent from the sheet's header row — a missing column affects every row, so this is checked once up front rather than per row. */
function findMissingColumns(rows: Record<string, string>[]): string[] {
  if (rows.length === 0) return [];
  const present = new Set(Object.keys(rows[0]));
  return REQUIRED_COLUMNS.filter((column) => !present.has(column));
}

type DecimalCellResult = { value: string } | { error: "empty" | "invalid" };

/**
 * Accepts plain digits with an optional decimal point and thousands commas
 * ("50,000,000" or "50000000") — not currency-symbol or Indonesian
 * dot-thousands formatting, since the spreadsheet already exports clean
 * numbers, not display strings.
 */
function parseDecimalCell(raw: string | undefined): DecimalCellResult {
  const cleaned = (raw ?? "").replace(/,/g, "").trim();
  if (cleaned === "") return { error: "empty" };
  return DECIMAL_PATTERN.test(cleaned) ? { value: cleaned } : { error: "invalid" };
}

function decimalFieldError(result: { error: "empty" | "invalid" }, fieldName: string): string {
  return result.error === "empty" ? `${fieldName} is empty.` : `${fieldName} must be a valid number.`;
}

interface ParsedSheetRow {
  programId: string;
  reportMonth: number;
  reportYear: number;
  totalFund: string;
  monthlyIncome: string;
  monthlyExpense: string;
  currentBalance: string;
  notes: string | null;
}

/**
 * Validates one row and resolves its program, in the order given: required
 * fields present, month/year are integers (kept within a sane calendar
 * range — 1–12 / 2000–2100 — a strict superset of "must be an integer"
 * that catches an obviously-wrong value like month 13 before it reaches
 * the database), financial values are numeric, and the slug names a real
 * program.
 */
function parseAndValidateRow(
  row: Record<string, string>,
  programBySlug: Map<string, { id: string }>
): ParsedSheetRow | { error: string } {
  const slug = row.program_slug;
  if (!slug) {
    return { error: "program_slug is empty." };
  }

  const program = programBySlug.get(slug);
  if (!program) {
    return { error: `program_slug "${slug}" does not match any financial program.` };
  }

  const reportMonthRaw = row.report_month?.trim();
  if (!reportMonthRaw) {
    return { error: "report_month is empty." };
  }
  const reportMonth = Number(reportMonthRaw);
  if (!Number.isInteger(reportMonth) || reportMonth < 1 || reportMonth > 12) {
    return { error: "report_month must be an integer between 1 and 12." };
  }

  const reportYearRaw = row.report_year?.trim();
  if (!reportYearRaw) {
    return { error: "report_year is empty." };
  }
  const reportYear = Number(reportYearRaw);
  if (!Number.isInteger(reportYear) || reportYear < MIN_YEAR || reportYear > MAX_YEAR) {
    return { error: `report_year must be an integer between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }

  const totalFund = parseDecimalCell(row.total_fund);
  if ("error" in totalFund) {
    return { error: decimalFieldError(totalFund, "total_fund") };
  }

  const monthlyIncome = parseDecimalCell(row.monthly_income);
  if ("error" in monthlyIncome) {
    return { error: decimalFieldError(monthlyIncome, "monthly_income") };
  }

  const monthlyExpense = parseDecimalCell(row.monthly_expense);
  if ("error" in monthlyExpense) {
    return { error: decimalFieldError(monthlyExpense, "monthly_expense") };
  }

  const currentBalance = parseDecimalCell(row.current_balance);
  if ("error" in currentBalance) {
    return { error: decimalFieldError(currentBalance, "current_balance") };
  }

  return {
    programId: program.id,
    reportMonth,
    reportYear,
    totalFund: totalFund.value,
    monthlyIncome: monthlyIncome.value,
    monthlyExpense: monthlyExpense.value,
    currentBalance: currentBalance.value,
    notes: row.notes || null,
  };
}

/** The most recent of `latestPeriod` and (reportMonth, reportYear) — no separate pass over the rows, just compared alongside the upsert loop. */
function laterPeriod(
  latestPeriod: { month: number; year: number } | undefined,
  reportMonth: number,
  reportYear: number
): { month: number; year: number } {
  if (!latestPeriod || reportYear > latestPeriod.year || (reportYear === latestPeriod.year && reportMonth > latestPeriod.month)) {
    return { month: reportMonth, year: reportYear };
  }
  return latestPeriod;
}

/**
 * Imports FinancialReport rows from the Public_Data worksheet's published
 * CSV export (`FINANCE_SHEET_CSV_URL` must be that worksheet's own
 * "Publish to web" link, not the workbook's default tab — see
 * docs/financial-sync.md §7). The spreadsheet is the source of all
 * calculation/aggregation now; this function only imports its already-
 * summarized rows: download (lib/finance/csv.ts) → parse → validate each
 * row → find its FinancialProgram by slug → upsert.
 *
 * This is the single import path for both the manual "Sync from
 * Spreadsheet" admin button and the daily cron — lib/finance/sync-monitoring.ts
 * wraps this one function for both call sites; neither re-implements any
 * part of it.
 *
 * One row = one program's report for one month, matched to an existing
 * FinancialReport by the same `(programId, reportMonth, reportYear)` key
 * the admin form already enforces as unique. On a new row, the report is
 * created already published — the whole point is figures appearing on the
 * homepage without an admin opening the CMS. On an existing row, only the
 * figures/notes are overwritten; `isPublished`/`publishedAt` are left
 * exactly as they were, so a re-sync can never silently re-publish
 * something an admin deliberately unpublished. Every row this function
 * touches is stamped `dataSource: "spreadsheet"`.
 *
 * A row that fails validation (bad/unknown slug, non-numeric figure,
 * out-of-range month/year) is skipped and reported, not fatal to the rest
 * of the sync — one bad row shouldn't block every other program's update.
 */
export async function syncFinancialReports(actorUserId: string): Promise<FinancialSheetSyncResult> {
  const csvUrl = process.env.FINANCE_SHEET_CSV_URL;
  if (!csvUrl) {
    return {
      created: 0,
      updated: 0,
      skipped: [],
      fetchError: "Spreadsheet sync is not set up yet. Please ask a developer to connect the Google Sheet.",
    };
  }

  const download = await downloadCsv(csvUrl);
  if ("error" in download) {
    return { created: 0, updated: 0, skipped: [], fetchError: download.error };
  }

  const rows = parseCsvRows(download.rows);

  const missingColumns = findMissingColumns(rows);
  if (missingColumns.length > 0) {
    return {
      created: 0,
      updated: 0,
      skipped: [],
      fetchError: `Missing required column${missingColumns.length > 1 ? "s" : ""}: ${missingColumns.join(", ")}.`,
    };
  }

  const programs = await prisma.financialProgram.findMany({ select: { id: true, slug: true } });
  const programBySlug = new Map(programs.map((program) => [program.slug, program]));

  let created = 0;
  let updated = 0;
  const skipped: FinancialSheetSyncSkippedRow[] = [];
  let latestPeriod: { month: number; year: number } | undefined;

  // Sequential, not parallel — each row upserts against the same
  // (programId, reportMonth, reportYear) unique key its neighbors could
  // collide on, and a spreadsheet sync is expected to cover a handful of
  // programs/months, not thousands of rows.
  // ponytail: sequential upserts, parallelize (e.g. batched Promise.all)
  // if the sheet ever grows large enough for this loop to be slow.
  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2; // +1 for 0-index, +1 for the header row
    const parsed = parseAndValidateRow(row, programBySlug);

    if ("error" in parsed) {
      skipped.push({ row: rowNumber, programSlug: row.program_slug || undefined, reason: parsed.error });
      continue;
    }

    const existing = await prisma.financialReport.findUnique({
      where: {
        programId_reportMonth_reportYear: {
          programId: parsed.programId,
          reportMonth: parsed.reportMonth,
          reportYear: parsed.reportYear,
        },
      },
    });

    if (existing) {
      await prisma.financialReport.update({
        where: { id: existing.id },
        data: {
          totalFund: parsed.totalFund,
          monthlyIncome: parsed.monthlyIncome,
          monthlyExpense: parsed.monthlyExpense,
          currentBalance: parsed.currentBalance,
          notes: parsed.notes,
          dataSource: SYNC_DATA_SOURCE,
          updatedById: actorUserId,
        },
      });
      updated++;
    } else {
      await prisma.financialReport.create({
        data: {
          programId: parsed.programId,
          reportMonth: parsed.reportMonth,
          reportYear: parsed.reportYear,
          totalFund: parsed.totalFund,
          monthlyIncome: parsed.monthlyIncome,
          monthlyExpense: parsed.monthlyExpense,
          currentBalance: parsed.currentBalance,
          notes: parsed.notes,
          dataSource: SYNC_DATA_SOURCE,
          isPublished: true,
          publishedAt: new Date(),
          createdById: actorUserId,
          updatedById: actorUserId,
        },
      });
      created++;
    }
    latestPeriod = laterPeriod(latestPeriod, parsed.reportMonth, parsed.reportYear);
  }

  if (skipped.length > 0) {
    console.error("Financial report spreadsheet sync skipped rows:", skipped);
  }

  return { created, updated, skipped, latestPeriod };
}
