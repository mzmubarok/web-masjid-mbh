export interface FinancialSyncEnvStatus {
  csvUrlConfigured: boolean;
  cronSecretConfigured: boolean;
}

/**
 * Whether the two environment variables Google Sheets sync depends on are
 * actually set — read fresh on every call (no caching), so a page render
 * always reflects the live config. Single source of truth for this check,
 * used by the admin sync panel and the cron route, so neither re-reads
 * `process.env` on its own.
 */
export function getFinancialSyncEnvStatus(): FinancialSyncEnvStatus {
  return {
    csvUrlConfigured: Boolean(process.env.FINANCE_SHEET_CSV_URL),
    cronSecretConfigured: Boolean(process.env.CRON_SECRET),
  };
}
