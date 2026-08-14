import { notFound } from "next/navigation";

import { getSocialMediaById } from "@/lib/social-media/social-media";
import { getSocialMediaPostsBySocialMediaId } from "@/lib/social-media/social-media-posts";
import { getMediaLibrary } from "@/lib/media/media";
import { SocialMediaForm } from "@/components/admin/SocialMediaForm";
import { AddSocialMediaPostForm } from "@/components/admin/AddSocialMediaPostForm";
import { SocialMediaPostRow } from "@/components/admin/SocialMediaPostRow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

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

  const [media, posts] = await Promise.all([getMediaLibrary(), getSocialMediaPostsBySocialMediaId(id)]);

  // Embedded post/video management only applies to Instagram and TikTok —
  // the two platforms this CMS knows an official embed mechanism for (see
  // components/features/social). Same case-insensitive matching convention
  // as Footer's socialPlatformIcon and app/page.tsx's socialLinks wiring.
  const normalizedPlatform = social.platform.toLowerCase();
  const isInstagram = normalizedPlatform.includes("instagram");
  const isTikTok = normalizedPlatform.includes("tiktok");
  const itemLabel = isInstagram ? "Post" : "Video";

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

      {isInstagram || isTikTok ? (
        <>
          <AddSocialMediaPostForm
            socialMediaId={social.id}
            itemLabel={itemLabel}
            urlHint={
              isInstagram
                ? "https://www.instagram.com/p/... or /reel/..."
                : "https://www.tiktok.com/@account/video/1234567890"
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>{itemLabel}s</CardTitle>
              <CardDescription>
                {itemLabel}s shown on the homepage, in display order. Only published {itemLabel.toLowerCase()}s appear.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <p className="text-small text-muted-foreground">
                  No {itemLabel.toLowerCase()}s yet — add one using the form above.
                </p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <SocialMediaPostRow
                      key={post.id}
                      post={post}
                      isFirst={index === 0}
                      isLast={index === posts.length - 1}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
