import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const iconButtonVariants = cva(
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-5",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost: "bg-transparent text-foreground hover:bg-muted",
      },
    },
    defaultVariants: { variant: "ghost" },
  }
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** The icon element, e.g. `<Menu />` from lucide-react. */
  children: ReactNode;
  /** Required — an icon-only button is meaningless to screen readers without it. */
  "aria-label": string;
}

/** Square, icon-only button. Always 44×44px minimum for a compliant touch target. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant, className, children, ...props }, ref) => (
    <button ref={ref} className={cn(iconButtonVariants({ variant }), className)} {...props}>
      {children}
    </button>
  )
);
IconButton.displayName = "IconButton";
