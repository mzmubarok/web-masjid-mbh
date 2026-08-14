import { CalculationParameters, Madhab } from "adhan";
import type { PrayerSetting } from "@/lib/generated/prisma/client";

/**
 * Lembaga Falakiyah Nahdlatul Ulama's standard — this site's default
 * calculation mode. These three values are fixed by the LFNU standard
 * itself, never admin-editable: whenever `PrayerSetting.calculationMode` is
 * `"LFNU"`, they're used exactly as-is, regardless of whatever
 * fajrAngle/ishaAngle/madhab happen to be stored on that row.
 */
export const LFNU_PARAMETERS = {
  fajrAngle: 20,
  ishaAngle: 18,
  madhab: "Shafi",
} as const;

const MADHAB_BY_LABEL: Record<string, (typeof Madhab)[keyof typeof Madhab]> = {
  Shafi: Madhab.Shafi,
  Hanafi: Madhab.Hanafi,
};

/**
 * Builds adhan's `CalculationParameters` for one `PrayerSetting` row.
 * `"LFNU"` mode always uses `LFNU_PARAMETERS`; `"CUSTOM"` mode uses the
 * row's own fajrAngle/ishaAngle/madhab (falling back to the LFNU angle if a
 * custom one was left blank, so calculation never runs on a 0° angle).
 * `method` is passed as `null` — every mode here is driven by an explicit
 * Fajr/Isha angle pair, never one of adhan's named CalculationMethod
 * presets (none of which correspond to the LFNU standard anyway).
 */
export function buildCalculationParameters(setting: PrayerSetting): CalculationParameters {
  const isLfnu = setting.calculationMode === "LFNU";

  const fajrAngle = isLfnu ? LFNU_PARAMETERS.fajrAngle : (setting.fajrAngle?.toNumber() ?? LFNU_PARAMETERS.fajrAngle);
  const ishaAngle = isLfnu ? LFNU_PARAMETERS.ishaAngle : (setting.ishaAngle?.toNumber() ?? LFNU_PARAMETERS.ishaAngle);
  const madhabLabel = isLfnu ? LFNU_PARAMETERS.madhab : setting.madhab;

  const parameters = new CalculationParameters(null, fajrAngle, ishaAngle);
  parameters.madhab = MADHAB_BY_LABEL[madhabLabel] ?? Madhab.Shafi;
  return parameters;
}
