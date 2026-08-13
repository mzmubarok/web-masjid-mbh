import { getMediaLibrary } from "@/lib/media/media";
import { DonationProgramForm } from "@/components/admin/DonationProgramForm";

export default async function NewDonationProgramPage() {
  const media = await getMediaLibrary();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Create Donation Program
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Tambahkan program donasi baru untuk ditampilkan di beranda.
        </p>
      </div>

      <DonationProgramForm media={media} />
    </div>
  );
}
