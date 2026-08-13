import { notFound } from "next/navigation";

import { getFinancialProgramById } from "@/lib/finance/financial-programs";
import { getMediaLibrary } from "@/lib/media/media";
import { FinancialProgramForm } from "@/components/admin/FinancialProgramForm";

export default async function EditFinancialProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getFinancialProgramById(id);

  if (!program) {
    notFound();
  }

  const media = await getMediaLibrary();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Edit Financial Program
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Perbarui detail program keuangan.
        </p>
      </div>

      <FinancialProgramForm program={program} media={media} />
    </div>
  );
}
