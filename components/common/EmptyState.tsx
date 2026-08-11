import type { ReactNode } from "react";
import { Stack } from "@/components/layout/Stack";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Slot for a call to action, e.g. `<Button>Add item</Button>`. */
  action?: ReactNode;
  className?: string;
}

/** Placeholder for a list/section with no content yet. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-16 text-center", className)}>
      <Stack gap="sm" align="center">
        {icon ? (
          <div className="text-muted-foreground [&_svg]:size-8" aria-hidden>
            {icon}
          </div>
        ) : null}
        <p className="text-h4 font-heading text-heading">{title}</p>
        {description ? (
          <p className="max-w-(--content-max-width) text-body text-text">{description}</p>
        ) : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </Stack>
    </div>
  );
}
