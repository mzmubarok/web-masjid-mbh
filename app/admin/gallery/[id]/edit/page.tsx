import { notFound } from "next/navigation";

import { getGalleryAlbumById } from "@/lib/gallery/gallery-albums";
import { getEvents } from "@/lib/events/events";
import { getMediaLibrary } from "@/lib/media/media";
import { GalleryAlbumForm } from "@/components/admin/GalleryAlbumForm";
import { AddGalleryPhotoForm } from "@/components/admin/AddGalleryPhotoForm";
import { GalleryPhotoRow } from "@/components/admin/GalleryPhotoRow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function EditGalleryAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getGalleryAlbumById(id);

  if (!album) {
    notFound();
  }

  // getEvents() returns every Event — the album's own associated Event (if
  // any) is always among them, even if it's since gone unpublished, so the
  // form's dropdown never silently loses the current selection.
  const [events, media] = await Promise.all([getEvents(), getMediaLibrary()]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Edit Album
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Perbarui detail album dan kelola fotonya.
        </p>
      </div>

      <GalleryAlbumForm album={album} events={events} media={media} />

      <AddGalleryPhotoForm albumId={album.id} media={media} />

      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>
            Photos in this album, in display order. Removing a photo never deletes its Media record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {album.photos.length === 0 ? (
            <p className="text-small text-muted-foreground">
              No photos yet — add one using the form above.
            </p>
          ) : (
            <div className="space-y-4">
              {album.photos.map((photo, index) => (
                <GalleryPhotoRow
                  key={photo.id}
                  photo={photo}
                  isFirst={index === 0}
                  isLast={index === album.photos.length - 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
