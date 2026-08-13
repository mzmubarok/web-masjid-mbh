import { notFound } from "next/navigation";

import { getMediaById } from "@/lib/media/media";
import { MediaMetadataForm } from "@/components/admin/MediaMetadataForm";

export default async function EditMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const media = await getMediaById(id);

  if (!media) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Edit Media
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Perbarui judul, teks alternatif, deskripsi, dan folder.
        </p>
      </div>

      <MediaMetadataForm media={media} />
    </div>
  );
}
