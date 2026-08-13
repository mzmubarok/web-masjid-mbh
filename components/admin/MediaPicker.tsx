"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import type { Media } from "@/lib/generated/prisma/client";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface MediaPickerProps {
  /** The full selectable Media list — the Media Library has no pagination yet, so this is the complete set. */
  media: Media[];
  /** Name of the hidden input the selected Media id is submitted under. */
  name: string;
  defaultValue?: string | null;
}

/**
 * Smallest reusable "select an existing Media record" UI — no picker existed
 * anywhere in the project before this (Hero/Tagline forms still ask for a
 * pasted Media id). Single-select only; never uploads or creates Media.
 */
export function MediaPicker({ media, name, defaultValue = null }: MediaPickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(defaultValue);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return media;
    }
    return media.filter((item) => item.fileName.toLowerCase().includes(q));
  }, [media, query]);

  const selected = selectedId ? media.find((item) => item.id === selectedId) : undefined;

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={selectedId ?? ""} />

      <Input
        type="search"
        placeholder="Search by file name…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search media"
      />

      <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-md border border-border p-2 sm:grid-cols-4">
        {filtered.length === 0 ? (
          <p className="col-span-full py-4 text-center text-caption text-muted-foreground">
            No media found.
          </p>
        ) : (
          filtered.map((item) => {
            const isSelected = item.id === selectedId;
            const isSvg = item.mimeType === "image/svg+xml";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : item.id)}
                aria-pressed={isSelected}
                aria-label={item.fileName}
                title={item.fileName}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border-2 bg-muted transition-colors",
                  isSelected ? "border-primary" : "border-transparent hover:border-border"
                )}
              >
                {isSvg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.storagePath}
                    alt={item.altText ?? item.fileName}
                    className="size-full object-contain p-2"
                  />
                ) : (
                  <Image
                    src={item.storagePath}
                    alt={item.altText ?? item.fileName}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      <p className="text-caption text-muted-foreground">
        {selected ? (
          <>
            Selected: {selected.fileName}{" "}
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-primary underline underline-offset-4"
            >
              Clear
            </button>
          </>
        ) : (
          "No file selected."
        )}
      </p>
    </div>
  );
}
