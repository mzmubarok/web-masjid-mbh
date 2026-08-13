import { getCurrentAbout } from "@/lib/about/about";
import { AboutForm } from "@/components/admin/AboutForm";

export default async function AboutPage() {
  const about = await getCurrentAbout();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          About Section
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Kelola pengantar, sejarah, visi, dan misi masjid yang tampil di halaman Tentang.
        </p>
      </div>

      <AboutForm about={about} />
    </div>
  );
}
