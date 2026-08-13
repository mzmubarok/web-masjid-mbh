export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Selamat datang di Dashboard
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Kelola konten dan informasi website masjid dari sini.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Events"
          description="Kelola kegiatan masjid"
        />

        <DashboardCard
          title="Gallery"
          description="Kelola foto dan album"
        />

        <DashboardCard
          title="Finance"
          description="Kelola laporan keuangan"
        />

        <DashboardCard
          title="Settings"
          description="Kelola konfigurasi website"
        />
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-h4 font-heading font-semibold text-heading">
          Aktivitas Terbaru
        </h3>

        <p className="mt-2 text-small text-muted-foreground">
          Belum ada aktivitas terbaru.
        </p>
      </section>
    </div>
  );
}

function DashboardCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-body font-semibold text-foreground">
        {title}
      </h3>

      <p className="mt-2 text-small text-muted-foreground">
        {description}
      </p>
    </div>
  );
}