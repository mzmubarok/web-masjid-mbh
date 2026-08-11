import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type LogoTone = "default" | "inverted";

export interface LogoProps {
  /** The institution's name — required, this component ships with no default/placeholder text. */
  name: string;
  /** Optional mark rendered before the name, e.g. an `<Image>` from public/logo/. */
  mark?: ReactNode;
  /** Wraps the logo in a `<Link>` when provided. */
  href?: string;
  size?: "sm" | "md" | "lg";
  /** Use "inverted" on a colored/dark band (e.g. `Section background="heading"`). @default "default" */
  tone?: LogoTone;
  className?: string;
}

const sizeClass = {
  sm: "text-h4",
  md: "text-h2",
  lg: "text-h1",
} as const;

const toneClass: Record<LogoTone, string> = {
  default: "text-heading",
  inverted: "text-surface",
};

/** Wordmark logo — typography-led per the design system, no ornamental iconography baked in. */
export function Logo({ name, mark, href, size = "md", tone = "default", className }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {mark}
      <span className={cn("font-heading", toneClass[tone], sizeClass[size])}>{name}</span>
    </span>
  );

  return href ? (
    <Link href={href} className="inline-flex" aria-label={name}>
      {content}
    </Link>
  ) : (
    content
  );
}
