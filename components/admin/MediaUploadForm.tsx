"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { upload } from "@vercel/blob/client";

import { checkMediaDuplicate, createMediaRecord } from "@/app/admin/media/action";
import { buildStoredFileName } from "@/lib/media/filename";
import { ALLOWED_MEDIA_MIME_TYPES, MAX_MEDIA_FILE_SIZE_BYTES, isAllowedMediaMimeType } from "@/lib/media/constraints";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type UploadStatus = "idle" | "hashing" | "checking" | "uploading" | "saving" | "success" | "error";

const BUSY_LABEL: Partial<Record<UploadStatus, string>> = {
  hashing: "Preparing file…",
  checking: "Checking for duplicates…",
  uploading: "Uploading…",
  saving: "Saving…",
};

async function sha256Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** SVGs are vector and often have no reliable intrinsic pixel size — left null rather than guessed. */
async function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (file.type === "image/svg+xml") {
    return null;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    return null;
  }
}

const MAX_FILE_SIZE_LABEL = `${Math.round(MAX_MEDIA_FILE_SIZE_BYTES / (1024 * 1024))} MB`;

export function MediaUploadForm() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = status === "hashing" || status === "checking" || status === "uploading" || status === "saving";

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    // Reset so choosing the same file again still fires a change event.
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!isAllowedMediaMimeType(file.type)) {
      setStatus("error");
      setMessage("Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF, SVG.");
      return;
    }

    if (file.size > MAX_MEDIA_FILE_SIZE_BYTES) {
      setStatus("error");
      setMessage(`File is larger than the ${MAX_FILE_SIZE_LABEL} limit.`);
      return;
    }

    try {
      setStatus("hashing");
      setMessage("");
      const checksum = await sha256Hex(file);

      setStatus("checking");
      const duplicate = await checkMediaDuplicate(checksum);
      if (duplicate.duplicate) {
        setStatus("error");
        setMessage(`This file already exists in the media library ("${duplicate.fileName}").`);
        return;
      }

      const dimensions = await readImageDimensions(file);
      const storedFileName = buildStoredFileName(file.name, file.type);

      setStatus("uploading");
      const blob = await upload(storedFileName, file, {
        access: "public",
        handleUploadUrl: "/api/media/upload",
        contentType: file.type,
      });

      setStatus("saving");
      const result = await createMediaRecord({
        url: blob.url,
        storedFileName,
        fileName: file.name,
        checksum,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
      });

      setStatus(result.status === "success" ? "success" : "error");
      setMessage(result.message);
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("error");
      setMessage("Something went wrong while uploading. Please try again.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
        <CardDescription>JPEG, PNG, WEBP, GIF, or SVG — up to {MAX_FILE_SIZE_LABEL}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button type="button" onClick={() => inputRef.current?.click()} loading={isBusy} disabled={isBusy}>
            {isBusy ? BUSY_LABEL[status] : "Choose File"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_MEDIA_MIME_TYPES.join(",")}
            onChange={handleFileChange}
            disabled={isBusy}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          />
        </div>

        <div
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={cn(
            "text-small",
            status === "success" && "text-success",
            status === "error" && "text-destructive",
            (status === "idle" || isBusy) && "sr-only"
          )}
        >
          {message}
        </div>
      </CardContent>
    </Card>
  );
}
