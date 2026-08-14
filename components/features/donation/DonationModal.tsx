"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, Copy, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Divider } from "@/components/ui/Divider";
import { Stack } from "@/components/layout/Stack";

export interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  /** All three are optional — the section already renders fine with none of them configured; see the "belum tersedia" fallback below. */
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  /** Static, hardcoded for now — no CMS/upload for this yet, see report. */
  qrisImageSrc?: string;
}

/**
 * Donation dialog — QRIS + bank transfer only, no payment gateway. Built on
 * the native `<dialog>` element rather than a hand-rolled div/portal: no
 * modal library exists in this project yet, and `<dialog>.showModal()`
 * gives focus-trapping, top-layer rendering (no z-index token needed, no
 * portal needed), ESC-to-close, and return-focus-on-close for free —
 * exactly this component's own requirements, with nothing left to build.
 * Backdrop-click-to-close is the one piece `<dialog>` doesn't do natively;
 * it's added below by checking the click's own target.
 */
export function DonationModal({
  open,
  onClose,
  bankName,
  bankAccountName,
  bankAccountNumber,
  qrisImageSrc = "/images/qris-masjid.png",
}: DonationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [qrisFailed, setQrisFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Bridges the controlled `open` prop onto the dialog's own imperative
  // open/close API — `<dialog>` has no declarative "open as a modal" mode.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // The single place that reports "the dialog closed" back to the parent —
  // covers ESC (the browser closes the dialog itself, firing this) and the
  // backdrop-click handler below (which calls onClose() directly; the
  // effect above then calls .close(), which fires this too — a harmless
  // second call, not a loop, since `open` doesn't change again from it).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  async function handleCopy() {
    if (!bankAccountNumber) return;
    try {
      await navigator.clipboard.writeText(bankAccountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (insecure context, older browser) — no
      // further fallback for this minimal feature; the button just no-ops.
    }
  }

  const hasBankInfo = bankName || bankAccountName || bankAccountNumber;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="donation-modal-title"
      // A click lands on the dialog element itself only when it's on the
      // backdrop area — any click on the panel/content below hits a child
      // element instead, so this never fires for those.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-border bg-card p-0 text-card-foreground backdrop:bg-foreground/50 backdrop:backdrop-blur-sm"
    >
      <Stack gap="lg" className="relative p-6 sm:p-8">
        <IconButton aria-label="Tutup" variant="ghost" onClick={onClose} className="absolute right-4 top-4">
          <X aria-hidden />
        </IconButton>

        <Stack gap="xs" align="center">
          <h2 id="donation-modal-title" className="text-h3 font-heading text-heading">
            Salurkan Infaq
          </h2>
          <p className="text-small text-muted-foreground">Scan QRIS</p>
        </Stack>

        {qrisFailed ? (
          <div className="mx-auto flex aspect-square w-full max-w-64 items-center justify-center rounded-md bg-muted text-muted-foreground/50">
            <ImageIcon className="size-10" aria-hidden />
          </div>
        ) : (
          <div className="relative mx-auto aspect-square w-full max-w-64 overflow-hidden rounded-md bg-muted">
            <Image
              src={qrisImageSrc}
              alt="Kode QRIS untuk donasi"
              fill
              sizes="256px"
              className="object-contain p-4"
              onError={() => setQrisFailed(true)}
            />
          </div>
        )}

        <Divider label="Atau transfer ke" />

        {hasBankInfo ? (
          <Stack gap="xs" align="center">
            {bankName && <p className="text-body font-medium text-heading">{bankName}</p>}
            {bankAccountNumber && (
              <p className="text-h4 font-heading tabular-nums text-heading">{bankAccountNumber}</p>
            )}
            {bankAccountName && <p className="text-small text-muted-foreground">a.n. {bankAccountName}</p>}
          </Stack>
        ) : (
          <p className="text-center text-small text-muted-foreground">
            Informasi rekening belum tersedia. Silakan hubungi pengurus masjid.
          </p>
        )}

        <Button
          variant="outline"
          onClick={handleCopy}
          disabled={!bankAccountNumber}
          aria-live="polite"
          leftIcon={
            copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />
          }
        >
          {copied ? "Tersalin!" : "Copy Nomor Rekening"}
        </Button>

        <Button variant="ghost" onClick={onClose} className="self-end">
          Tutup
        </Button>
      </Stack>
    </dialog>
  );
}
