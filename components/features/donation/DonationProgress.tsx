import { cn } from "@/lib/utils";

export interface DonationProgressProps {
  raised: number;
  goal: number;
  className?: string;
}

/** Accessible progress bar for a donation campaign's raised/goal amounts. */
export function DonationProgress({ raised, goal, className }: DonationProgressProps) {
  const percent = goal > 0 ? Math.min(100, Math.max(0, (raised / goal) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
