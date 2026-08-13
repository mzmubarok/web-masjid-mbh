import { getEvents } from "@/lib/events/events";
import { getMediaLibrary } from "@/lib/media/media";
import { GalleryAlbumForm } from "@/components/admin/GalleryAlbumForm";

export default async function NewGalleryAlbumPage() {
  const [events, media] = await Promise.all([getEvents(), getMediaLibrary()]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Create Album
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Tambahkan album galeri baru untuk ditampilkan di beranda.
        </p>
      </div>

      <GalleryAlbumForm events={events} media={media} />
    </div>
  );
}
