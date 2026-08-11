import { cn } from "@/lib/utils";

export type HijriDateTone = "default" | "inverted";

export interface HijriDateProps {
  /** Pre-formatted Hijri date, e.g. "12 Ramadan 1447 AH". No calendar conversion here. */
  date: string;
  /** Optional pre-formatted Gregorian date shown alongside, e.g. "March 3, 2026". */
  gregorianDate?: string;
  /** Use "inverted" on a colored band (e.g. `Section background="primary"`). @default "default" */
  tone?: HijriDateTone;
  className?: string;
}

const toneClass: Record<HijriDateTone, { date: string; gregorian: string }> = {
  default: { date: "text-heading", gregorian: "text-muted-foreground" },
  inverted: { date: "text-primary-foreground", gregorian: "text-primary-foreground/70" },
};

/** Displays an already-formatted Hijri date, optionally paired with its Gregorian equivalent. */
export function HijriDate({ date, gregorianDate, tone = "default", className }: HijriDateProps) {
  const colors = toneClass[tone];
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <p className={cn("text-body-lg font-heading", colors.date)}>{date}</p>
      {gregorianDate ? <p className={cn("text-caption", colors.gregorian)}>{gregorianDate}</p> : null}
    </div>
  );
}
