import type { ReactNode } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Stack } from "@/components/layout/Stack";
import { cn } from "@/lib/utils";

export interface LocationCardProps {
  name: string;
  address: string;
  /** Link to directions (e.g. a maps URL) — rendered only when provided. */
  directionsHref?: string;
  directionsLabel?: string;
  /** Slot for a map embed/image, rendered above the address. */
  mapSlot?: ReactNode;
  className?: string;
}

/** Address card with an optional map slot and directions link. */
export function LocationCard({
  name,
  address,
  directionsHref,
  directionsLabel = "Get directions",
  mapSlot,
  className,
}: LocationCardProps) {
  return (
    <Card padding="none" className={cn("overflow-hidden", className)}>
      {mapSlot}
      <div className="p-(--space-card-padding)">
        <Stack gap="sm">
          <CardHeader>
            <CardTitle>{name}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="inline-flex items-start gap-2 text-small text-text">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {address}
            </span>
          </CardContent>
          {directionsHref ? (
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-button text-primary hover:underline"
            >
              <Navigation className="size-4" aria-hidden />
              {directionsLabel}
            </a>
          ) : null}
        </Stack>
      </div>
    </Card>
  );
}
