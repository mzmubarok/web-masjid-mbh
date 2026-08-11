import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const loadingVariants = cva("motion-safe:animate-spin text-primary", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-10",
    },
  },
  defaultVariants: { size: "md" },
});

export interface LoadingProps extends VariantProps<typeof loadingVariants> {
  /** Screen-reader-only text announcing what's loading. @default "Loading" */
  label?: string;
  className?: string;
}

/** Accessible loading spinner — announces via `role="status"`, visually just the icon. */
export function Loading({ size, label = "Loading", className }: LoadingProps) {
  return (
    <div role="status" className={cn("inline-flex", className)}>
      <Loader2 className={loadingVariants({ size })} aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
