import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export interface ActivePrayerCardProps {
  /** e.g. "Maghrib" — already localized by the caller. */
  name: string;
  /** Pre-formatted time, e.g. "17:48". No time calculation lives here. */
  time: string;
  /** Pre-formatted "HH:MM:SS" — ticked by `usePrayerCountdown` in the caller. */
  countdown: string;
  icon?: ComponentType<{ className?: string }>;
  /** Intensifies the highlight once under ~10 minutes remain. Never animated/flashy. */
  urgent?: boolean;
  className?: string;
}

/**
 * The featured "next prayer" card inside `PrayerScheduleCard` — primary
 * (green) background, white typography, and a live countdown. Purely
 * presentational: `countdown` and `urgent` are computed by the caller
 * (`usePrayerCountdown`), never derived here, so this component doesn't
 * itself need to tick every second to stay accurate.
 */
export function ActivePrayerCard({
  name,
  time,
  countdown,
  icon: Icon,
  urgent = false,
  className,
}: ActivePrayerCardProps) {
  return (
    <div
      className={cn(
        // Only slightly larger than the secondary PrayerCards (min-w-[3.25rem])
        // now — still the visual focus via color/ring/countdown, not sheer size.
        "flex min-w-[4.5rem] shrink-0 flex-col items-center gap-0.5 rounded-xl bg-primary px-2.5 py-2 text-center ring-accent shadow-lg transition-[box-shadow] duration-300",
        urgent ? "ring-4" : "ring-2",
        className
      )}
    >
      {Icon ? (
        <div className="text-primary-foreground/80 [&_svg]:size-3.5" aria-hidden>
          <Icon />
        </div>
      ) : null}
      <span className="text-caption text-primary-foreground/80">Sholat Selanjutnya</span>
      <span className="text-caption font-heading text-primary-foreground">{name}</span>
      {/* Ticks every second — screen readers get a live, if frequent, update
          per the brief's explicit aria-live requirement. Gold accent + bold
          (rather than the surrounding white/80% type) so the countdown —
          the one number people actually glance at — pops off the teal
          background instead of blending into the label/name/time around it. */}
      <p
        aria-live="polite"
        className={cn(
          "font-heading font-bold tabular-nums text-accent",
          urgent ? "text-body-lg" : "text-small"
        )}
      >
        {countdown}
      </p>
      <span className="text-caption text-primary-foreground/80">{time}</span>
    </div>
  );
}
