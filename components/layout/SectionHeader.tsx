import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Stack } from "@/components/layout/Stack";

export type SectionHeaderAlign = "left" | "center";
export type SectionHeaderLevel = "h1" | "h2" | "h3" | "h4";
export type SectionHeaderTone = "default" | "inverted";

export interface SectionHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Small label above the title, e.g. "Our Programs". */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /**
   * Heading tag AND matching type-scale step (h1→Display-ish down to h4) —
   * pick this for correct document heading hierarchy, not for size alone.
   * @default "h2"
   */
  level?: SectionHeaderLevel;
  /** @default "left" */
  align?: SectionHeaderAlign;
  /**
   * Use "inverted" when the header sits on a colored band (`Section
   * background="primary"` or `"secondary"`) instead of the default page
   * background — swaps text colors for contrast against that fill.
   * @default "default"
   */
  tone?: SectionHeaderTone;
}

const titleSizeClass: Record<SectionHeaderLevel, string> = {
  h1: "text-display",
  h2: "text-h1",
  h3: "text-h2",
  h4: "text-h3",
};

const toneClass: Record<SectionHeaderTone, { eyebrow: string; title: string; description: string }> = {
  default: { eyebrow: "text-primary", title: "text-heading", description: "text-text" },
  inverted: {
    eyebrow: "text-accent",
    title: "text-primary-foreground",
    description: "text-primary-foreground/80",
  },
};

/**
 * Standard section intro: optional eyebrow, a title at the right heading
 * level, and an optional description. Use `level` to keep the page's
 * heading hierarchy sequential (don't skip levels) — it also picks the
 * matching type-scale step, so it doesn't need a separate size prop.
 */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    { eyebrow, title, description, level = "h2", align = "left", tone = "default", className, ...props },
    ref
  ) => {
    const Heading = level;
    const centered = align === "center";
    const colors = toneClass[tone];

    return (
      <div
        ref={ref}
        className={cn("w-full", centered ? "mx-auto text-center" : "text-left", className)}
        {...props}
      >
        <Stack gap="sm" align={centered ? "center" : "start"}>
          {eyebrow ? <p className={cn("text-label", colors.eyebrow)}>{eyebrow}</p> : null}
          <Heading className={cn("font-heading", colors.title, titleSizeClass[level])}>
            {title}
          </Heading>
          {description ? (
            <p
              className={cn(
                "text-body-lg max-w-(--content-max-width)",
                colors.description,
                centered && "mx-auto"
              )}
            >
              {description}
            </p>
          ) : null}
        </Stack>
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";
