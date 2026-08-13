import { notFound } from "next/navigation";

import { getEventById } from "@/lib/events/events";
import { getSelectableEventCategories } from "@/lib/events/event-categories";
import { EventForm } from "@/components/admin/EventForm";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const categories = await getSelectableEventCategories(event.categoryId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Edit Event
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Perbarui detail kegiatan.
        </p>
      </div>

      <EventForm event={event} categories={categories} />
    </div>
  );
}
