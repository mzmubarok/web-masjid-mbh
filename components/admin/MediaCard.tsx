import Image from "next/image";
import Link from "next/link";

import type { Media } from "@/lib/generated/prisma/client";
import { Card, CardContent } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { DeleteMediaButton } from "@/components/admin/DeleteMediaButton";
import { cn } from "@/lib/utils";

export interface MediaCardProps {
  media: Media;
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaCard({ media }: MediaCardProps) {
  const isSvg = media.mimeType === "image/svg+xml";

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="relative aspect-square w-full bg-muted">
        {isSvg ? (
          // next/image can't reliably size an unstyled SVG without an
          // intrinsic viewBox-derived width/height; a plain <img> here
          // avoids a broken/empty thumbnail for this one format.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.storagePath}
            alt={media.altText ?? media.fileName}
            className="size-full object-contain p-2"
          />
        ) : (
          <Image
            src={media.storagePath}
            alt={media.altText ?? media.fileName}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
        )}
      </div>

      <CardContent className="space-y-2 p-4">
        <p className="truncate text-small font-medium text-foreground" title={media.fileName}>
          {media.fileName}
        </p>

        <dl className="space-y-0.5 text-caption text-muted-foreground">
          {media.width && media.height ? (
            <div>
              {media.width} × {media.height}
            </div>
          ) : null}
          <div>
            {formatFileSize(media.fileSize)} · {media.mimeType}
          </div>
          <div>Uploaded {dateFormatter.format(media.createdAt)}</div>
          {media.folder ? <div>Folder: {media.folder}</div> : null}
        </dl>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Link
            href={`/admin/media/${media.id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Edit
          </Link>
          <DeleteMediaButton id={media.id} fileName={media.fileName} />
        </div>
      </CardContent>
    </Card>
  );
}
