import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { Stack } from "@/components/layout/Stack";
import { cn } from "@/lib/utils";

export interface EventCardProps {
  title: string;
  /** Slot for a category tag, e.g. `<Badge tone="primary">Kajian</Badge>`. */
  category?: ReactNode;
  /** Pre-formatted date, e.g. "14 Maret 2026". No date logic lives here. */
  date: string;
  /** Pre-formatted time, e.g. "19.30 WIB". */
  time: string;
  location?: string;
  imageSrc?: string;
  imageAlt?: string;
  href: string;
  /** @default "Lihat Detail" */
  ctaLabel?: string;
  className?: string;
}

/** A single event listing — presentational only. */
export function EventCard({
  title,
  category,
  date,
  time,
  location,
  imageSrc,
  imageAlt = "",
  href,
  ctaLabel = "Lihat Detail",
  className,
}: EventCardProps) {
  return (
    <Card interactive padding="none" className={cn("group flex h-full flex-col overflow-hidden", className)}>
      {imageSrc ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-6 p-(--space-card-padding)">
        <Stack gap="sm" className="flex-1">
          {category}
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <Stack gap="xs">
            <span className="inline-flex items-center gap-2 text-small text-text">
              <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden />
              {date}
            </span>
            <span className="inline-flex items-center gap-2 text-small text-text">
              <Clock3 className="size-4 shrink-0 text-primary" aria-hidden />
              {time}
            </span>
            {location ? (
              <span className="inline-flex items-center gap-2 text-small text-text">
                <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                {location}
              </span>
            ) : null}
          </Stack>
        </Stack>

        <Link href={href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}>
          {ctaLabel}
        </Link>
      </div>
    </Card>
  );
}
