import { cn } from "@/lib/utils";

export interface PrayerCountdownProps {
  /** e.g. "Maghrib" — the prayer being counted down to. */
  prayerName: string;
  /**
   * Pre-formatted remaining-time string, e.g. "02:15:33". This component
   * does not tick or compute time itself — feed it a value from a hook/
   * interval owned by the page, and it just re-renders when the prop changes.
   */
  value: string;
  label?: string;
  className?: string;
}

/** Presentational countdown display. No timers or date math live here. */
export function PrayerCountdown({
  prayerName,
  value,
  label = "Time until",
  className,
}: PrayerCountdownProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <p className="text-label text-muted-foreground">
        {label} {prayerName}
      </p>
      <p className="text-display font-heading tabular-nums text-heading">{value}</p>
    </div>
  );
}
