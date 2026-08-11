import { forwardRef } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gapClassMap, type Gap } from "@/lib/layout";

export type StackAlign = "start" | "center" | "end" | "stretch";

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Element/tag to render. @default "div" */
  as?: ElementType;
  /** Gap between children, on the 8px scale. @default "md" */
  gap?: Gap;
  /** Cross-axis (horizontal) alignment. @default "stretch" */
  align?: StackAlign;
  children?: ReactNode;
}

const alignClass: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

/** Vertical flex layout with a consistent, token-driven gap between children. */
export const Stack = forwardRef<HTMLElement, StackProps>(
  ({ as: tag = "div", gap = "md", align = "stretch", className, children, ...props }, ref) => {
    const Tag = tag as ElementType;
    return (
      <Tag
        ref={ref}
        className={cn("flex flex-col", gapClassMap[gap], alignClass[align], className)}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Stack.displayName = "Stack";
