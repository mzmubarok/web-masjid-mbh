import { getMediaLibrary } from "@/lib/media/media";
import { ALLOWED_MEDIA_MIME_TYPES } from "@/lib/media/constraints";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { MediaCard } from "@/components/admin/MediaCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; folder?: string; mimeType?: string }>;
}) {
  const { q, folder, mimeType } = await searchParams;
  const media = await getMediaLibrary({ q, folder, mimeType });
  const hasFilters = Boolean(q || folder || mimeType);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Media Library
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Kelola gambar yang digunakan di seluruh website masjid.
        </p>
      </div>

      <MediaUploadForm />

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-label text-foreground">File Name</label>
          <Input id="q" name="q" defaultValue={q ?? ""} placeholder="Search…" className="w-48" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="folder" className="text-label text-foreground">Folder</label>
          <Input id="folder" name="folder" defaultValue={folder ?? ""} placeholder="e.g. events" className="w-40" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="mimeType" className="text-label text-foreground">Type</label>
          <select
            id="mimeType"
            name="mimeType"
            defaultValue={mimeType ?? ""}
            className="h-11 rounded-md border border-input bg-surface px-4 text-body text-foreground"
          >
            <option value="">All types</option>
            {ALLOWED_MEDIA_MIME_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" variant="outline">Filter</Button>
        {hasFilters ? (
          <a href="/admin/media" className="text-caption text-muted-foreground underline underline-offset-4">
            Clear filters
          </a>
        ) : null}
      </form>

      {media.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-small text-muted-foreground">
          {hasFilters ? "No media matches these filters." : "No media uploaded yet — use the form above to add the first file."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      )}
    </div>
  );
}
