import { getSelectableEventCategories } from "@/lib/events/event-categories";
import { getMediaLibrary } from "@/lib/media/media";
import { EventForm } from "@/components/admin/EventForm";

export default async function NewEventPage() {
  const [categories, media] = await Promise.all([getSelectableEventCategories(), getMediaLibrary()]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Create Event
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Tambahkan kegiatan baru untuk ditampilkan di beranda.
        </p>
      </div>

      <EventForm categories={categories} media={media} />
    </div>
  );
}
