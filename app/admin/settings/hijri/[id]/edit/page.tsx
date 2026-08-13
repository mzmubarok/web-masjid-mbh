import { notFound } from "next/navigation";

import { getHijriOverrideById } from "@/lib/hijri/hijri-overrides";
import { toDateInputValue } from "@/lib/date";
import { HijriOverrideForm } from "@/components/admin/HijriOverrideForm";

export default async function EditHijriOverridePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const override = await getHijriOverrideById(id);

  if (!override) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Edit Override
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Perbarui koreksi tanggal Hijriah.
        </p>
      </div>

      <HijriOverrideForm
        override={{
          id: override.id,
          // Decimal/Date instances can't cross the Server -> Client
          // Component boundary as-is — serialize to a plain YYYY-MM-DD
          // string first.
          gregorianDate: toDateInputValue(override.gregorianDate),
          hijriDay: override.hijriDay,
          hijriMonth: override.hijriMonth,
          hijriYear: override.hijriYear,
          notes: override.notes,
          source: override.source,
        }}
      />
    </div>
  );
}
