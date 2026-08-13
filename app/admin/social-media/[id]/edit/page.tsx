import { notFound } from "next/navigation";

import { getSocialMediaById } from "@/lib/social-media/social-media";
import { getMediaLibrary } from "@/lib/media/media";
import { SocialMediaForm } from "@/components/admin/SocialMediaForm";

export default async function EditSocialMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const social = await getSocialMediaById(id);

  if (!social) {
    notFound();
  }

  const media = await getMediaLibrary();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Edit Social Media Link
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Perbarui detail tautan media sosial.
        </p>
      </div>

      <SocialMediaForm social={social} media={media} />
    </div>
  );
}
