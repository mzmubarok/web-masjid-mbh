import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Styled native input. Always pair with a visible `<label htmlFor>` —
 * this component doesn't render one itself (composition, not configuration).
 * Set `aria-invalid` to show the error state.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-md border border-input bg-surface px-4 text-body text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors duration-150",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
