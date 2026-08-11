import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageWrapperProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * Root shell for a page: full viewport height (`min-h-dvh`, not `100vh` —
 * avoids the mobile browser-chrome jump) with a column flex layout so a
 * footer sticks to the bottom on short pages.
 *
 * Deliberately unopinionated beyond that — it does not render a header,
 * `<main>`, or footer. Compose those yourself, e.g.:
 * `<PageWrapper><Navbar /><main className="flex-1">…</main><Footer /></PageWrapper>`
 */
export const PageWrapper = forwardRef<HTMLDivElement, PageWrapperProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex min-h-dvh flex-col", className)} {...props}>
        {children}
      </div>
    );
  }
);
PageWrapper.displayName = "PageWrapper";
