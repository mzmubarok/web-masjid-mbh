# Financial Transparency — Google Sheets Sync

How the homepage's "Laporan Keuangan" (Financial Transparency) section gets its numbers, how those numbers can be kept up to date from a Google Sheet without opening the CMS, and how to troubleshoot it when something looks wrong.

This document covers the system built across Phases 1–5 of the Financial Transparency work, the Spreadsheet Automation Phase 1 refactor (briefly section-aware), and Phase 2, which replaced that with the current flat design once the spreadsheet itself took over all calculation/aggregation. It's written for whoever touches this code next — a developer maintaining it, or an administrator who just needs to know what a button does and why a sync failed.

## 1. Overall Architecture

```
Google Spreadsheet — Public_Data worksheet only, published as CSV.
Every other worksheet in the workbook does the calculation/aggregation
and is never read by this sync directly.
        │
        │  fetch(FINANCE_SHEET_CSV_URL)
        ▼
lib/finance/csv.ts        — downloadCsv(): fetch + validate response + lex into raw cell rows
        ▼
lib/finance/sync.ts
  syncFinancialReports()
  — parses the flat CSV (one row = one FinancialReport already summarized),
    validates and upserts every row
        │
        ▼
lib/finance/sync-monitoring.ts
  recordFinancialSheetSync()
  — wraps the function above with a FinancialSyncRun history row
    and a simple "only one sync at a time" lock
        │
        ├── triggered manually ──▶ "Sync from Spreadsheet" button
        │                          (app/admin/finance/reports)
        │
        └── triggered daily ─────▶ app/api/cron/financial-sync/route.ts
                                    (Vercel Cron, see vercel.json)
        │
        ▼
FinancialReport (Postgres, via Prisma)
        │
        │  getHomepageFinancialSummaries()
        ▼
app/page.tsx  →  components/sections/Financial.tsx
        │
        ▼
Public homepage — "Laporan Keuangan" section
```

**The database is always the source the public site reads.** The homepage never fetches Google Sheets directly, and never will under this design — the spreadsheet is a *periodic input* to `FinancialReport`, not a live backend. If the spreadsheet is unreachable, mistyped, or the sync hasn't run in days, the homepage still shows whatever was last written to the database (or the section's own hardcoded placeholder copy, if the database has nothing published yet).

Two Prisma models carry the actual data (unchanged since Phase 1):

- **`FinancialProgram`** — one row per fund (e.g. "Infaq Harian", slug `infaq-harian`). Has `isActive`, `showOnHomepage`, `displayOrder`, and a unique `slug` — every CSV row names its program by this `slug` (a `program_slug` column), never by name or internal id. The spreadsheet is expected to already have the slug right; a row whose slug doesn't match any program is skipped, not guessed at.
- **`FinancialReport`** — one row per program per calendar month (`reportMonth` 1–12, `reportYear`). `dataSource` is `"manual"` (the schema default, set by the admin edit form) or `"spreadsheet"` (set only by the sync). `isPublished`/`publishedAt` control whether a report is eligible for the homepage.

A third model, added in Phase 4, exists purely for observability and is never read by the public site:

- **`FinancialSyncRun`** — one row per sync *attempt* (manual or cron), whatever its outcome. Powers the "Spreadsheet Sync" panel in the admin.

## 2. Homepage Data Flow

`app/page.tsx` calls `getHomepageFinancialSummaries()` (`lib/finance/financial-reports.ts`), which returns, for every `FinancialProgram` where `isActive: true` and `showOnHomepage: true`, that program's single most recent `FinancialReport` where `isPublished: true` — a program with no published report yet is simply left out of the result (not shown with a placeholder).

`app/page.tsx` then formats each report's Decimal figures into plain currency strings (`formatFinancialAmount`, `lib/finance/format-finance.ts`) and computes a shared `lastUpdated` label from whichever report in the batch has the most recent period, before handing everything to `<Financial>` as plain props. `Financial.tsx` itself is presentational only — it doesn't know or care whether the data behind it came from a spreadsheet, a cron job, or an admin typing numbers into a form. If nothing is published anywhere, `<Financial>` renders with no `funds` prop and falls back to its own three hardcoded example cards — this is intentional, pre-existing behavior, unrelated to the sync system, and was never changed by this work.

## 3. Manual Sync Flow

1. An admin opens **Admin → Finance → Financial Reports** (`/admin/finance/reports`) and clicks **Sync from Spreadsheet**.
2. This submits `syncFinancialReportsFromSheetAction` (`app/admin/finance/reports/action.ts`), a Server Action, which:
   - confirms the admin is signed in,
   - calls `recordFinancialSheetSync(actorUserId, "manual")`,
   - revalidates `/admin/finance/reports`, `/admin/finance`, and `/` (the homepage) on success,
   - returns a structured result (`created`, `updated`, `skipped`, `durationMs`, `latestPeriod`) that the button renders as a short summary.
3. `recordFinancialSheetSync` (`lib/finance/sync-monitoring.ts`) is the **only** thing either sync path calls — it checks no other sync is already running, creates a `FinancialSyncRun` row with `status: "running"`, calls `syncFinancialReportsFromSheet` (the actual import logic), and updates that row to `"success"` or `"error"` with the outcome.
4. The button (`components/admin/SyncFinancialReportsButton.tsx`) is disabled while pending and shows a plain-language summary afterward, including per-row skip reasons if any rows were skipped.

## 4. Automatic Cron Flow

`app/api/cron/financial-sync/route.ts` is a `GET` Route Handler intended to be called once a day by Vercel Cron (see `vercel.json`). On each call it:

1. Confirms `CRON_SECRET` is configured at all (`lib/finance/env-status.ts`) — if not, returns `500` immediately without attempting anything.
2. Checks the request's `Authorization` header is exactly `Bearer <CRON_SECRET>` — Vercel adds this header automatically to cron-triggered requests once `CRON_SECRET` is set on the project. Anything else (missing, wrong value) is rejected with `401`.
3. Resolves an "actor" to attribute the sync to — a scheduled run has no signed-in admin, so it uses the longest-standing `Super Admin` user in the database (`FinancialReport.createdById`/`updatedById` are required, non-nullable fields).
4. Calls the exact same `recordFinancialSheetSync(actor.id, "cron")` the manual button calls. If a manual sync happens to be running at the same moment, this call is rejected with `409` rather than running concurrently.
5. Revalidates `/` on success and returns a small JSON summary.

**The cron scheduler itself (`vercel.json`) exists but a live schedule/CI trigger has not been exercised in production** — this doc describes the endpoint's own behavior, which was verified directly (`curl` with a correct/incorrect/missing `Authorization` header).

## 5. Required Environment Variables

| Variable | Used by | Purpose |
|---|---|---|
| `FINANCE_SHEET_CSV_URL` | `syncFinancialReportsFromSheet` (both sync paths) | The CSV export URL of the published Google Sheet (see §7). Never has a default — if unset, every sync attempt fails immediately with a clear, non-technical message and is recorded as a failed `FinancialSyncRun`. |
| `CRON_SECRET` | the cron route only | Shared secret Vercel Cron sends as `Authorization: Bearer <value>`. Never has a default — if unset, the cron route refuses to run at all (`500`, before even checking the header) and logs the reason server-side. |

Neither variable is read anywhere on the public homepage or in any Client Component — both are read only inside server-only files (`lib/finance/sync.ts`, `lib/finance/env-status.ts`, the cron route), so neither can leak into the browser bundle.

**Where this shows up in the admin UI:** if either variable is missing, the "Spreadsheet Sync" panel on `/admin/finance/reports` shows a plain warning banner naming which *feature* is affected ("the spreadsheet connection" / "automatic daily sync") — it never prints the raw environment variable name to that screen. The raw name only ever appears in server logs (`console.error`), for whoever actually has to go fix the configuration.

## 6. CSV Format

As of Phase 2, the spreadsheet does all calculation/aggregation itself and the `Public_Data` worksheet exports one row per `FinancialReport`, already summarized — flat, no sections, no grouping. The sync (`lib/finance/sync.ts`) expects a plain header row followed by one data row per program-per-month. Header matching is case/space-insensitive (`"Program Slug"` and `"program_slug"` both work) and columns can be in any order.

| Column | Required | Meaning |
|---|---|---|
| `program_slug` | yes | Must exactly match an existing `FinancialProgram.slug`. |
| `report_month` | yes | Integer, 1–12. |
| `report_year` | yes | Integer, 2000–2100. |
| `total_fund` | yes | Plain number. Commas as thousands separators are accepted ("50,000,000"); currency symbols and dot-thousands formatting ("Rp 50.000.000") are **not** — the spreadsheet is expected to export clean numbers. |
| `monthly_income` | yes | Same numeric format as `total_fund`. |
| `monthly_expense` | yes | Same numeric format as `total_fund`. |
| `current_balance` | yes | Same numeric format as `total_fund`. |
| `notes` | no | Free text, stored as-is (including a literal `-` placeholder, if the sheet uses one — it's not treated specially). |

Example:

```csv
program_slug,report_month,report_year,total_fund,monthly_income,monthly_expense,current_balance,notes
infaq-harian,8,2026,1500000,250000,50000,1700000,-
infaq-pembangunan,8,2026,20000000,1000000,500000,20500000,-
```

**What happens to each row:**

- A row missing a required column entirely (the *column*, not just a blank cell) fails the whole sync immediately with `Missing required column: <name>.` — nothing is written.
- A row with a blank required cell, an unrecognized `program_slug`, an out-of-range month/year, or a non-numeric figure is **skipped** (not fatal) and reported with its row number, the row's own `program_slug` (when it had one), and a specific reason, e.g. `Row 5: current_balance is empty.` or `Row 8: program_slug "infaq-pembangunan" does not match any financial program.` — every other valid row in the same sync still gets processed.
- A valid row for a **new** `(program, month, year)` combination creates a `FinancialReport`, already published (`isPublished: true`), stamped `dataSource: "spreadsheet"`.
- A valid row for an **existing** combination updates that report's figures and `notes` only — it never touches `isPublished`/`publishedAt`. If an admin manually unpublished a report, re-syncing the same period will update its numbers but leave it unpublished; the sync can never silently re-publish something a human deliberately took down.

## 7. Spreadsheet Integration

The sync reads a **CSV export of a Google Sheet published to the web** — not the Google Sheets API, and no service-account credentials. This was a deliberate choice (see the Phase 3 architectural audit): it needs zero new dependencies and no secret beyond the URL itself.

To connect a real sheet:

1. In Google Sheets: **File → Share → Publish to web**.
2. Choose the **`Public_Data` worksheet specifically** — the workbook may have other tabs that do the actual calculation/aggregation feeding into it, but the sync must only ever read `Public_Data`'s own export; publishing the workbook's default/first tab by mistake will point the sync at the wrong data (or fail column validation entirely). Set the format to **CSV**.
3. Click **Publish**, and copy the resulting link (it looks like `https://docs.google.com/spreadsheets/d/e/<long-id>/pub?gid=<gid>&single=true&output=csv` — the `gid` identifies the specific worksheet, which is what makes this per-tab, not per-workbook).
4. Set that link as `FINANCE_SHEET_CSV_URL` in the project's environment variables (locally in `.env`, in production in the Vercel project settings) — never commit it or hardcode it in source.

There's no code-level way to double-check "is this really the `Public_Data` tab" beyond the column/value shape matching what's expected — a published CSV link is just a URL to Google, it carries no worksheet name. Getting the right `gid` published is an operational step, done once when connecting the sheet.

**Security note, stated plainly:** "Publish to web" makes that sheet's published range readable by anyone with the link, with no login required. This is an accepted tradeoff for the zero-infrastructure approach, not an oversight — if the mosque's financial figures need to stay non-public prior to being synced, the Google Sheets API (with a service-account credential, never publishing the sheet itself) is the alternative, at the cost of a new dependency and a secret to manage. That path was evaluated and intentionally not taken for this phase.

## 8. Troubleshooting

**"Spreadsheet Sync" panel says a warning banner about setup** — one or both of `FINANCE_SHEET_CSV_URL` / `CRON_SECRET` isn't set in this environment. Set it and redeploy/restart; no code change is needed.

**Manual sync button shows an error immediately** — read the message; it's already written to be actionable (e.g. "Could not download the spreadsheet. Please check that it's still published and publicly accessible."). The full technical detail (HTTP status, raw fetch error) is always also logged via `console.error` server-side for a developer checking logs.

**A sync says rows were skipped** — click-through isn't needed; the button's summary and the "Spreadsheet Sync" panel don't show every skip reason inline (only the count), but every skip is logged server-side (`console.error("Financial report spreadsheet sync skipped rows:", ...)`) with the row number and reason. The manual sync's own result message additionally lists up to the first 3 skip reasons directly.

**"A sync is already in progress"** — either a real sync (manual or cron) is genuinely running, or a previous run crashed hard enough to skip its own cleanup. A `FinancialSyncRun` row stuck in `"running"` is only treated as an active lock for 5 minutes (`STALE_RUN_MS` in `lib/finance/sync-monitoring.ts`) — after that it's ignored and a new sync is allowed to start. No manual intervention is normally needed; if it is, the stuck row can be updated directly (`status: "error"`, set `finishedAt`) via a one-off script.

**Homepage doesn't reflect a sync that reported success** — confirm the synced report is actually `isPublished: true` for that program (an update to a previously-unpublished report stays unpublished by design, see §6) and that the program has `isActive: true` and `showOnHomepage: true`. If both are correct and it's still stale, confirm `revalidatePath("/")` actually ran (it's called at the end of every successful sync in both the manual action and the cron route) — a Vercel deployment-level caching issue would be the next thing to check, not this codebase's logic.

**Cron endpoint returns 401 even with what looks like the right secret** — the header must be exactly `Authorization: Bearer <CRON_SECRET>` (note "Bearer " with a single space, case-sensitive scheme). This matches what Vercel Cron sends automatically once `CRON_SECRET` is set on the project — it isn't something to construct by hand in production.

## 9. Future Maintenance Notes

- **`STALE_RUN_MS` (5 minutes) is a fixed constant**, not configurable. Revisit if sync frequency or the size of the sheet ever changes meaningfully (a much larger sheet could genuinely take longer than 5 minutes to process, given the sync's upserts run sequentially, not in parallel — see the `ponytail:` comment in `lib/finance/sync.ts`).
- **The cron route resolves its "actor" by querying for the oldest `Super Admin` user at request time.** If that account is ever deleted or its role renamed, the cron will start failing with `"No Super Admin user found."` — this is a real, if unlikely, single point of failure worth knowing about before it surprises anyone.
- **`FinancialSyncRun` has no retention/pruning.** It will grow by one row per sync attempt forever (once a day at minimum, once cron is actually scheduled). Nothing in this system currently deletes old rows. `getFinancialSyncHistory()` only ever *reads* the most recent 10, so this isn't a functional problem yet, but an unbounded table is worth a cleanup job if the project runs for years.
- **A real spreadsheet has not been connected end-to-end in this codebase's test history.** Every verification pass (Phases 3–5) used a `data:` URL standing in for a real Google Sheets CSV export, because Node's `fetch` supports `data:` URLs and this avoided depending on an external, mutable Google Sheet during automated testing. The CSV *shape* has been validated thoroughly; a real Google Sheets export's exact byte-for-byte behavior (BOM, line endings, `gid` correctness) has not been separately confirmed and is worth a first-real-sheet smoke test before relying on this in production.
- **No admin UI currently shows `FinancialReport.dataSource`** (`"manual"` vs `"spreadsheet"`), even though the sync now populates it meaningfully. Surfacing that in the reports table would be a small, low-risk addition for a future phase if admins want to see at a glance which reports came from the sheet.
