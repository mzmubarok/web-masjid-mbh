import { notFound } from "next/navigation";

import { getDonationProgramById } from "@/lib/donations/donation-programs";
import { getMediaLibrary } from "@/lib/media/media";
import { DonationProgramForm } from "@/components/admin/DonationProgramForm";

export default async function EditDonationProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getDonationProgramById(id);

  if (!program) {
    notFound();
  }

  const media = await getMediaLibrary();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Edit Donation Program
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Perbarui detail program donasi.
        </p>
      </div>

      <DonationProgramForm program={program} media={media} />
    </div>
  );
}
