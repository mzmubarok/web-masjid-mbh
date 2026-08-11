import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ContactCardProps {
  /** e.g. `<Phone />` from lucide-react. */
  icon: ReactNode;
  /** e.g. "Phone", "Email", "Address". */
  label: string;
  value: string;
  /** Makes the card a link when provided, e.g. "tel:+62..." or "mailto:...". */
  href?: string;
  className?: string;
}

/** A single contact method. Renders as a link when `href` is given, otherwise static. */
export function ContactCard({ icon, label, value, href, className }: ContactCardProps) {
  const content = (
    <>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:size-5" aria-hidden>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-label text-muted-foreground">{label}</span>
        <span className="text-body text-heading">{value}</span>
      </div>
    </>
  );

  const classes = cn(
    "flex items-center gap-4 rounded-lg border border-border bg-card p-4",
    href && "cursor-pointer transition-colors duration-200 hover:bg-muted",
    className
  );

  return href ? (
    <a href={href} className={classes}>
      {content}
    </a>
  ) : (
    <div className={classes}>{content}</div>
  );
}
