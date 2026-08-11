import { forwardRef } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionVariants = cva("w-full", {
  variants: {
    /** Background surface for the section — all token-driven, no raw hex. */
    background: {
      background: "bg-background text-foreground",
      surface: "bg-surface text-foreground",
      muted: "bg-muted text-foreground",
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      heading: "bg-heading text-surface",
    },
    /**
     * Vertical padding, scaled off `--space-section-y` (already responsive
     * across breakpoints — see app/globals.css) so every step stays in sync.
     */
    spacing: {
      none: "py-0",
      sm: "py-[calc(var(--space-section-y)/2)]",
      md: "py-(--space-section-y)",
      lg: "py-[calc(var(--space-section-y)*1.5)]",
    },
  },
  defaultVariants: {
    background: "background",
    spacing: "md",
  },
});

export interface SectionProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  /** Element/tag to render. @default "section" */
  as?: "section" | "div" | "article" | "aside" | "footer";
  children?: ReactNode;
}

/**
 * A page section: controls vertical rhythm and background. Does not manage
 * horizontal width — nest a `<Container>` inside for that.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ as = "section", background, spacing, className, children, ...props }, ref) => {
    // See Container.tsx for why `as` is cast to ElementType before render.
    const Tag = as as ElementType;
    return (
      <Tag
        ref={ref}
        className={cn(sectionVariants({ background, spacing }), className)}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Section.displayName = "Section";
