import { forwardRef } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gapClassMap, gridColsClassMap, type Gap, type GridCols } from "@/lib/layout";

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** Element/tag to render. @default "div" */
  as?: ElementType;
  /** Column count at the widest breakpoint; scales down mobile-first. @default 3 */
  cols?: GridCols;
  /**
   * Gap between cells. Omit to use `--space-grid-gap` (the design system's
   * grid-gap token, already responsive across breakpoints); pass one of the
   * fixed scale values to override it for a denser/looser grid.
   */
  gap?: Gap;
  children?: ReactNode;
}

/** Responsive CSS grid: `cols` collapses down to 1 column on mobile automatically. */
export const Grid = forwardRef<HTMLElement, GridProps>(
  ({ as: tag = "div", cols = 3, gap, className, children, ...props }, ref) => {
    const Tag = tag as ElementType;
    return (
      <Tag
        ref={ref}
        className={cn(
          "grid",
          gridColsClassMap[cols],
          gap ? gapClassMap[gap] : "gap-(--space-grid-gap)",
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Grid.displayName = "Grid";
