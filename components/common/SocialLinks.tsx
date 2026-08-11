import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SocialLinksTone = "default" | "inverted";

export interface SocialLink {
  /** Platform name, used for the accessible label — e.g. "Instagram". */
  label: string;
  href: string;
  /** The platform's icon, e.g. `<Instagram />` from lucide-react. */
  icon: ReactNode;
}

export interface SocialLinksProps {
  /** No default links — fully data-driven, supply the institution's real profiles. */
  links: SocialLink[];
  /** Use "inverted" on a colored/dark band (e.g. `Section background="heading"`). @default "default" */
  tone?: SocialLinksTone;
  className?: string;
}

const toneClass: Record<SocialLinksTone, string> = {
  default: "text-foreground hover:bg-muted",
  inverted: "text-surface hover:bg-surface/10",
};

/** Row of icon links to external social profiles. */
export function SocialLinks({ links, tone = "default", className }: SocialLinksProps) {
  if (links.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={cn(
              "inline-flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 [&_svg]:size-5",
              toneClass[tone]
            )}
          >
            {link.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
