import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface PrayerCardProps {
  /** e.g. "Fajr", "Dhuhr" — already localized by the caller. */
  name: string;
  /** Pre-formatted time string, e.g. "04:32". No time/date logic lives here. */
  time: string;
  icon?: ReactNode;
  /** Visually emphasizes this as the current/next prayer. */
  isNext?: boolean;
  className?: string;
}

/**
 * A single prayer time. Purely presentational — the caller decides which one
 * is "next". `isNext` pops the card forward via a shadow + accent ring
 * (rather than a solid fill) so it reads correctly whether this sits on the
 * default page background or a colored `Section` band (e.g. Prayer Times'
 * `primary` band) — a solid `bg-primary` highlight would vanish into a
 * `primary`-colored parent.
 */
export function PrayerCard({ name, time, icon, isNext = false, className }: PrayerCardProps) {
  return (
    <Card
      padding="none"
      className={cn(
        "flex min-w-[3.25rem] flex-col items-center gap-1 p-2.5 text-center",
        isNext && "ring-2 ring-accent shadow-lg",
        className
      )}
    >
      {icon ? (
        <div className="text-primary [&_svg]:size-4" aria-hidden>
          {icon}
        </div>
      ) : null}
      <span className="text-caption text-muted-foreground">{name}</span>
      <span className="text-small font-heading font-bold text-heading">{time}</span>
    </Card>
  );
}
