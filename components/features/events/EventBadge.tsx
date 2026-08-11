import { Badge } from "@/components/ui/Badge";

export type EventStatus = "upcoming" | "ongoing" | "past" | "cancelled";

export interface EventBadgeProps {
  status: EventStatus;
  className?: string;
}

const statusConfig: Record<EventStatus, { label: string; tone: "primary" | "success" | "default" | "destructive" }> = {
  upcoming: { label: "Upcoming", tone: "primary" },
  ongoing: { label: "Ongoing", tone: "success" },
  past: { label: "Past", tone: "default" },
  cancelled: { label: "Cancelled", tone: "destructive" },
};

/** Maps a finite event status to a labeled Badge — status text always accompanies the color. */
export function EventBadge({ status, className }: EventBadgeProps) {
  const { label, tone } = statusConfig[status];
  return (
    <Badge tone={tone} className={className}>
      {label}
    </Badge>
  );
}
