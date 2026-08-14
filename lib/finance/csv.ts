/**
 * Downloads and lexes a published Google Sheets CSV export. Pure I/O and
 * CSV syntax only — no knowledge of sections, programs, or report fields.
 * Reused by `lib/finance/sync.ts` (and testable on its own with any CSV
 * URL, not tied to one env var).
 */

export type CsvDownloadOutcome = { rows: string[][] } | { error: string };

/**
 * Splits Google Sheets' "Publish to web → CSV" export (comma-separated,
 * double-quoted fields, `""` for a literal quote) into rows of raw cells.
 * Not a general-purpose CSV library — just enough for a single flat sheet
 * with no nested tables.
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

/**
 * Fetches `url` and lexes it into raw cell rows. Always fetches fresh
 * (`cache: "no-store"`) — the caller's own call frequency (a manual click,
 * or a cron tick) is what controls sync freshness, not Next.js's fetch
 * cache. Returns `{ error }` (a plain, already-actionable message) instead
 * of throwing, for both a non-2xx response and a network failure — the
 * caller decides how that surfaces (sync summary, admin banner, etc.).
 */
export async function downloadCsv(url: string): Promise<CsvDownloadOutcome> {
  let text: string;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      console.error(`Financial sheet sync: spreadsheet request failed with status ${response.status}.`);
      return { error: "Could not download the spreadsheet. Please check that it's still published and publicly accessible." };
    }
    text = await response.text();
  } catch (error) {
    console.error("Failed to fetch the financial report spreadsheet:", error);
    return { error: "Could not reach the spreadsheet. Please check that the Google Sheets link is still valid." };
  }

  return { rows: splitCsvRows(text) };
}
