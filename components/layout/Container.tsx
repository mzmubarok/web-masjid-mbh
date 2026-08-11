import { forwardRef } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ContainerSize =
  | "default" // --container-max-width (1280px) — standard page/section width
  | "content"; // --content-max-width (720px) — readable long-form measure

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Element/tag to render. @default "div" */
  as?: ElementType;
  size?: ContainerSize;
  children?: ReactNode;
}

const sizeClass: Record<ContainerSize, string> = {
  default: "max-w-(--container-max-width)",
  content: "max-w-(--content-max-width)",
};

/**
 * Centers content and applies the design system's horizontal page padding
 * (`--space-page-x`, already responsive across breakpoints — see
 * app/globals.css). Use `size="content"` for prose-width text blocks.
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ as = "div", size = "default", className, children, ...props }, ref) => {
    // Cast to a generic ElementType so a single forwardRef<HTMLElement> can
    // target whichever tag is rendered — TS can't unify per-tag ref types
    // (Ref<HTMLDivElement> vs Ref<HTMLElement>, etc.) across a variable tag.
    const Tag = as as ElementType;
    return (
      <Tag
        ref={ref}
        className={cn(
          "mx-auto w-full px-(--space-page-x)",
          sizeClass[size],
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Container.displayName = "Container";
