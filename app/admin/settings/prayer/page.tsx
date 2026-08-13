import { getPrayerSettings } from "@/lib/prayer/prayer-settings";
import { PrayerSettingsForm } from "@/components/admin/PrayerSettingsForm";

export default async function PrayerSettingsPage() {
  const settings = await getPrayerSettings();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Prayer Settings
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Kelola konfigurasi lokasi dan metode perhitungan waktu sholat masjid.
        </p>
      </div>

      {!settings ? (
        <div className="rounded-lg border border-border bg-card p-6 text-body text-muted-foreground">
          Prayer settings have not been configured yet. Fill in the form below to create them.
        </div>
      ) : null}

      <PrayerSettingsForm settings={settings} />
    </div>
  );
}
