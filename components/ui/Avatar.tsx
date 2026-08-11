import type { ReactNode } from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground",
  {
    variants: {
      size: {
        sm: "size-8 text-caption",
        md: "size-11 text-small",
        lg: "size-16 text-h4",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  /** Shown while the image is loading, missing, or fails to load — e.g. initials. */
  fallback: ReactNode;
  className?: string;
}

/** Profile picture with an automatic fallback if `src` is missing or fails to load. */
export function Avatar({ src, alt = "", fallback, size, className }: AvatarProps) {
  return (
    <BaseAvatar.Root className={cn(avatarVariants({ size }), className)}>
      {src ? <BaseAvatar.Image src={src} alt={alt} className="size-full object-cover" /> : null}
      <BaseAvatar.Fallback className="font-heading">{fallback}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
