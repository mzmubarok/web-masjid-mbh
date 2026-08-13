import Link from "next/link";

import { getSocialMediaList } from "@/lib/social-media/social-media";
import { getMediaLibrary } from "@/lib/media/media";
import { toggleSocialMediaActive } from "@/app/admin/social-media/action";
import { SocialMediaForm } from "@/components/admin/SocialMediaForm";
import { DeleteSocialMediaButton } from "@/components/admin/DeleteSocialMediaButton";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function SocialMediaPage() {
  const [links, media] = await Promise.all([getSocialMediaList(), getMediaLibrary()]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Social Media
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Kelola tautan media sosial yang ditampilkan di website masjid.
        </p>
      </div>

      <SocialMediaForm media={media} />

      <div className="rounded-lg border border-border bg-card">
        {links.length === 0 ? (
          <p className="p-6 text-small text-muted-foreground">
            No social media links yet — create the first one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Platform</th>
                  <th scope="col" className="px-4 py-3 font-medium">URL</th>
                  <th scope="col" className="px-4 py-3 font-medium">Display Order</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3 font-medium text-foreground">{link.platform}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-muted-foreground" title={link.url}>
                      {link.url}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{link.displayOrder}</td>
                    <td className="px-4 py-3">
                      <Badge tone={link.isActive ? "success" : "outline"}>
                        {link.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/social-media/${link.id}/edit`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Edit
                        </Link>

                        <form action={toggleSocialMediaActive.bind(null, link.id, !link.isActive)}>
                          <Button type="submit" variant="outline" size="sm">
                            {link.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </form>

                        <DeleteSocialMediaButton id={link.id} platform={link.platform} />
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
