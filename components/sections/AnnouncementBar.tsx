"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { IconButton } from "@/components/ui/IconButton";
import { EASE_PREMIUM } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface AnnouncementBarCta {
  label: string;
  href: string;
}

export interface AnnouncementBarProps {
  message: ReactNode;
  /** e.g. `<Megaphone />` from lucide-react. Purely decorative — hidden from screen readers. */
  icon?: ReactNode;
  /** A single, quiet inline link — never a filled button (see design-system/pages/homepage.md § 1). */
  cta?: AnnouncementBarCta;
  /** @default true */
  dismissible?: boolean;
  /**
   * Called after the dismiss animation starts. The bar only manages its own
   * visibility for this render — persisting the choice (e.g. sessionStorage,
   * so it reappears on a fresh visit) is the caller's responsibility.
   */
  onDismiss?: () => void;
  className?: string;
}

/**
 * Thin, dismissible utility strip for a single time-sensitive notice.
 * Section 1 of the homepage — see design-system/pages/homepage.md for the
 * full spec this implements.
 */
export function AnnouncementBar({
  message,
  icon,
  cta,
  dismissible = true,
  onDismiss,
  className,
}: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Announcement"
          initial={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_PREMIUM }}
          className={cn("overflow-hidden bg-primary text-primary-foreground", className)}
        >
          <Container className="flex items-center gap-3 py-2">
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
              {icon ? (
                <span className="shrink-0 [&_svg]:size-4" aria-hidden>
                  {icon}
                </span>
              ) : null}
              <p className="truncate text-small font-medium">{message}</p>
              {cta ? (
                <a
                  href={cta.href}
                  className="shrink-0 text-small font-semibold underline-offset-4 hover:underline"
                >
                  {cta.label}
                </a>
              ) : null}
            </div>
            {dismissible ? (
              <IconButton
                aria-label="Dismiss announcement"
                variant="ghost"
                onClick={handleDismiss}
                className="shrink-0 text-primary-foreground hover:bg-primary-foreground/10 [&_svg]:size-4"
              >
                <X aria-hidden />
              </IconButton>
            ) : null}
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
