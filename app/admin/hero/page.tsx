import { getCurrentHero } from "@/lib/hero/hero";
import { HeroForm } from "@/components/admin/HeroForm";

export default async function HeroPage() {
  const hero = await getCurrentHero();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Hero Section
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Kelola judul, subjudul, dan gambar latar Hero yang tampil di beranda.
        </p>
      </div>

      <HeroForm hero={hero} />
    </div>
  );
}
