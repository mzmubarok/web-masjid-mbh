import Link from "next/link";

import { getSiteSettings } from "@/lib/settings/site-settings";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-heading">
            Site Settings
          </h2>

          <p className="mt-2 text-body text-muted-foreground">
            Kelola konfigurasi utama website masjid.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/settings/prayer" className={cn(buttonVariants({ variant: "outline" }))}>
            Prayer Settings
          </Link>
          <Link href="/admin/settings/contact" className={cn(buttonVariants({ variant: "outline" }))}>
            Contact & Location
          </Link>
        </div>
      </div>

      {settings ? (
        <SiteSettingsForm settings={settings} />
      ) : (
        <div className="rounded-lg border border-border bg-card p-6 text-body text-muted-foreground">
          Site settings have not been initialized yet. Run the database seed to create the
          default record.
        </div>
      )}
    </div>
  );
}