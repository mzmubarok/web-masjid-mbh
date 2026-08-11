import type { ReactNode } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Stack } from "@/components/layout/Stack";
import { DonationProgress } from "@/components/features/donation/DonationProgress";
import { cn } from "@/lib/utils";

export interface DonationCardProps {
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  raised: number;
  goal: number;
  /** Formats the raw amounts for display — keeps currency/locale logic with the caller. */
  formatAmount: (amount: number) => string;
  /** Rendered below the progress bar, e.g. a `<Button>Donate</Button>`. */
  action?: ReactNode;
  className?: string;
}

/** A single donation campaign — presentational, no payment or fetch logic. */
export function DonationCard({
  title,
  description,
  imageSrc,
  imageAlt = "",
  raised,
  goal,
  formatAmount,
  action,
  className,
}: DonationCardProps) {
  return (
    <Card padding="none" className={cn("overflow-hidden", className)}>
      {imageSrc ? (
        <div className="relative aspect-video w-full">
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
        </div>
      ) : null}
      <div className="p-(--space-card-padding)">
        <Stack gap="sm">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </CardHeader>
          <CardContent>
            <Stack gap="xs">
              <DonationProgress raised={raised} goal={goal} />
              <div className="flex items-baseline justify-between text-small">
                <span className="font-medium text-heading">{formatAmount(raised)}</span>
                <span className="text-muted-foreground">of {formatAmount(goal)}</span>
              </div>
            </Stack>
          </CardContent>
          {action}
        </Stack>
      </div>
    </Card>
  );
}
