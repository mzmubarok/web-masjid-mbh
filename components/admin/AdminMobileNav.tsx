"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import { IconButton } from "@/components/ui/IconButton";

/**
 * Mobile-only nav trigger + drawer — the desktop sidebar (`AdminSidebar`) is
 * `hidden` below `md`, so this is the only way to reach admin navigation on
 * a narrow viewport. Renders the same `AdminNavLinks` the sidebar uses.
 */
export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  // Escape closes the drawer — the backdrop and each nav link already do too.
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <IconButton
        type="button"
        variant="ghost"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden />
      </IconButton>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />

          <div
            id="admin-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="absolute inset-y-0 left-0 w-64 max-w-[80vw] overflow-y-auto border-r border-border bg-card shadow-lg"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <span className="text-lg font-semibold">
                Masjid Admin
              </span>

              <IconButton
                type="button"
                variant="ghost"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
              >
                <X aria-hidden />
              </IconButton>
            </div>

            <AdminNavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
