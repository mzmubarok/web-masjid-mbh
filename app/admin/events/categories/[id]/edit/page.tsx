import { notFound } from "next/navigation";

import { getEventCategoryById } from "@/lib/events/event-categories";
import { EventCategoryForm } from "@/components/admin/EventCategoryForm";

export default async function EditEventCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getEventCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Edit Category
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Perbarui detail kategori kegiatan.
        </p>
      </div>

      <EventCategoryForm category={category} />
    </div>
  );
}
