import { prisma } from "@/lib/prisma";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;
const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

// Marks every report this sync writes, so a manually-entered report
// (`dataSource` stays at its schema default, "manual") is never confused
// with one that came from the spreadsheet.
const SYNC_DATA_SOURCE = "spreadsheet";

export interface FinancialSheetSyncSkippedRow {
  row: number;
  reason: string;
}

export interface FinancialSheetSyncResult {
  created: number;
  updated: number;
  skipped: FinancialSheetSyncSkippedRow[];
  /** Set when the sync couldn't run at all (missing config, network/HTTP failure) — `created`/`updated`/`skipped` are all 0 in that case. */
  fetchError?: string;
}

/**
 * Splits a small CSV export (Google Sheets' "Publish to web → CSV" shape:
 * comma-separated, double-quoted fields, `""` for a literal quote) into
 * rows of raw cells. Not a general-purpose CSV library — just enough for a
 * single flat sheet with no nested tables.
 */
function splitCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(cell: string): string {
  return cell.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Parses the CSV text into header-keyed row objects. Expected columns:
 * `program_slug`, `report_month`, `report_year`, `total_fund`,
 * `monthly_income`, `monthly_expense`, `current_balance`, and an optional
 * `notes`. Header matching is case/space-insensitive ("Program Slug" and
 * "program_slug" both work); blank rows are skipped.
 */
function parseCsv(text: string): Record<string, string>[] {
  const rows = splitCsvRows(text);
  if (rows.length === 0) return [];

  const header = rows[0].map(normalizeHeader);

  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => Object.fromEntries(header.map((key, index) => [key, (row[index] ?? "").trim()])));
}

/** Accepts plain digits with an optional decimal point and thousands commas ("50,000,000" or "50000000") — not currency-symbol or Indonesian dot-thousands formatting, since this column is meant for clean data entry, not display. */
function parseDecimalCell(raw: string | undefined): string | null {
  const cleaned = (raw ?? "").replace(/,/g, "").trim();
  return DECIMAL_PATTERN.test(cleaned) ? cleaned : null;
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

function parseSheetRow(
  row: Record<string, string>,
  programBySlug: Map<string, { id: string }>
): ParsedSheetRow | { error: string } {
  const slug = row.program_slug;
  if (!slug) {
    return { error: "Missing program_slug." };
  }

  const program = programBySlug.get(slug);
  if (!program) {
    return { error: `No financial program found with slug "${slug}".` };
  }

  const reportMonth = Number(row.report_month);
  if (!Number.isInteger(reportMonth) || reportMonth < 1 || reportMonth > 12) {
    return { error: `report_month must be 1-12, got "${row.report_month}".` };
  }

  const reportYear = Number(row.report_year);
  if (!Number.isInteger(reportYear) || reportYear < MIN_YEAR || reportYear > MAX_YEAR) {
    return { error: `report_year must be between ${MIN_YEAR} and ${MAX_YEAR}, got "${row.report_year}".` };
  }

  const totalFund = parseDecimalCell(row.total_fund);
  if (!totalFund) {
    return { error: `total_fund is not a valid number: "${row.total_fund}".` };
  }

  const monthlyIncome = parseDecimalCell(row.monthly_income);
  if (!monthlyIncome) {
    return { error: `monthly_income is not a valid number: "${row.monthly_income}".` };
  }

  const monthlyExpense = parseDecimalCell(row.monthly_expense);
  if (!monthlyExpense) {
    return { error: `monthly_expense is not a valid number: "${row.monthly_expense}".` };
  }

  const currentBalance = parseDecimalCell(row.current_balance);
  if (!currentBalance) {
    return { error: `current_balance is not a valid number: "${row.current_balance}".` };
  }

  return {
    programId: program.id,
    reportMonth,
    reportYear,
    totalFund,
    monthlyIncome,
    monthlyExpense,
    currentBalance,
    notes: row.notes || null,
  };
}

/**
 * Imports FinancialReport rows from a published Google Sheet CSV export
 * (`FINANCE_SHEET_CSV_URL` — Sheets' File → Share → "Publish to web" →
 * CSV link for the relevant sheet/tab). This is the single import path for
 * both the manual "Sync from Spreadsheet" admin button and, later, a
 * scheduled cron — neither should ever re-implement this logic, only call
 * it with a different `actorUserId`.
 *
 * One row = one program's report for one month. Matched to an existing
 * FinancialReport by the same `(programId, reportMonth, reportYear)` key
 * the admin form already enforces as unique. On a new row, the report is
 * created already published (the whole point is figures appearing on the
 * homepage without an admin opening the CMS). On an existing row, only the
 * figures/notes are overwritten — `isPublished` is left exactly as an
 * admin last set it, so a spreadsheet re-sync can never silently
 * re-publish something that was deliberately unpublished. Every row this
 * function touches is stamped `dataSource: "spreadsheet"`.
 *
 * A row that fails validation (bad slug, non-numeric figure, out-of-range
 * month/year) is skipped and reported, not fatal to the rest of the sync —
 * one typo in one row shouldn't block every other program's update.
 */
export async function syncFinancialReportsFromSheet(actorUserId: string): Promise<FinancialSheetSyncResult> {
  const csvUrl = process.env.FINANCE_SHEET_CSV_URL;
  if (!csvUrl) {
    return { created: 0, updated: 0, skipped: [], fetchError: "FINANCE_SHEET_CSV_URL is not configured." };
  }

  let csvText: string;
  try {
    // Always fetch fresh — this function's own call frequency (a manual
    // click, or later a cron tick) is what controls sync freshness; no
    // Next.js fetch cache should sit in between.
    const response = await fetch(csvUrl, { cache: "no-store" });
    if (!response.ok) {
      return {
        created: 0,
        updated: 0,
        skipped: [],
        fetchError: `Spreadsheet request failed with status ${response.status}.`,
      };
    }
    csvText = await response.text();
  } catch (error) {
    console.error("Failed to fetch the financial report spreadsheet:", error);
    return {
      created: 0,
      updated: 0,
      skipped: [],
      fetchError: "Could not reach the spreadsheet. Check FINANCE_SHEET_CSV_URL and network access.",
    };
  }

  const rows = parseCsv(csvText);
  const programs = await prisma.financialProgram.findMany({ select: { id: true, slug: true } });
  const programBySlug = new Map(programs.map((program) => [program.slug, program]));

  let created = 0;
  let updated = 0;
  const skipped: FinancialSheetSyncSkippedRow[] = [];

  // Sequential, not parallel — each row upserts against the same
  // (programId, reportMonth, reportYear) unique key its neighbors could
  // collide on, and a spreadsheet sync is expected to cover a handful of
  // programs/months, not thousands of rows.
  // ponytail: sequential upserts, parallelize (e.g. batched Promise.all)
  // if the sheet ever grows large enough for this loop to be slow.
  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2; // +1 for 0-index, +1 for the header row
    const parsed = parseSheetRow(row, programBySlug);

    if ("error" in parsed) {
      skipped.push({ row: rowNumber, reason: parsed.error });
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
  }

  if (skipped.length > 0) {
    console.error("Financial report spreadsheet sync skipped rows:", skipped);
  }

  return { created, updated, skipped };
}
