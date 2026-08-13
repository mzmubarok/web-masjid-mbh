import Link from "next/link";

import { getGalleryAlbums } from "@/lib/gallery/gallery-albums";
import { toggleGalleryAlbumPublished, toggleGalleryAlbumFeatured } from "@/app/admin/gallery/action";
import { DeleteGalleryAlbumButton } from "@/components/admin/DeleteGalleryAlbumButton";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function GalleryAlbumsPage() {
  const albums = await getGalleryAlbums();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-heading">
            Gallery
          </h2>

          <p className="mt-2 text-body text-muted-foreground">
            Kelola album galeri foto kegiatan masjid.
          </p>
        </div>

        <Link href="/admin/gallery/new" className={cn(buttonVariants({ variant: "primary" }))}>
          Create Album
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {albums.length === 0 ? (
          <p className="p-6 text-small text-muted-foreground">
            No albums yet — create the first one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Title</th>
                  <th scope="col" className="px-4 py-3 font-medium">Event</th>
                  <th scope="col" className="px-4 py-3 font-medium">Photos</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Featured</th>
                  <th scope="col" className="px-4 py-3 font-medium">Sort Order</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
                  <tr key={album.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3 font-medium text-foreground">{album.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{album.event?.title ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{album._count.photos}</td>
                    <td className="px-4 py-3">
                      <Badge tone={album.isPublished ? "success" : "outline"}>
                        {album.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {album.isFeatured ? <Badge tone="accent">Featured</Badge> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{album.sortOrder}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/gallery/${album.id}/edit`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Edit
                        </Link>

                        <form action={toggleGalleryAlbumPublished.bind(null, album.id, !album.isPublished)}>
                          <Button type="submit" variant="outline" size="sm">
                            {album.isPublished ? "Unpublish" : "Publish"}
                          </Button>
                        </form>

                        <form action={toggleGalleryAlbumFeatured.bind(null, album.id, !album.isFeatured)}>
                          <Button type="submit" variant="outline" size="sm">
                            {album.isFeatured ? "Unfeature" : "Feature"}
                          </Button>
                        </form>

                        <DeleteGalleryAlbumButton id={album.id} title={album.title} photoCount={album._count.photos} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
