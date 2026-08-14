import Link from "next/link";

import { getEvents } from "@/lib/events/events";
import { toggleEventPublished, toggleEventFeatured } from "@/app/admin/events/action";
import { DeleteEventButton } from "@/components/admin/DeleteEventButton";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Stored as UTC midnight (see lib/date.ts) — format in UTC so the displayed
// calendar date always matches what was picked, regardless of server timezone.
const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "UTC" });

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-heading">
            Events
          </h2>

          <p className="mt-2 text-body text-muted-foreground">
            Kelola kegiatan masjid yang ditampilkan di beranda.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/events/categories" className={cn(buttonVariants({ variant: "outline" }))}>
            Event Categories
          </Link>
          <Link href="/admin/events/new" className={cn(buttonVariants({ variant: "primary" }))}>
            Create Event
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {events.length === 0 ? (
          <p className="p-6 text-small text-muted-foreground">
            No events yet — create the first one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Title</th>
                  <th scope="col" className="px-4 py-3 font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 font-medium">Start</th>
                  <th scope="col" className="px-4 py-3 font-medium">Location</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Featured</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3 font-medium text-foreground">{event.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{event.category.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {dateFormatter.format(event.startDate)}
                      <br />
                      {event.startTime}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{event.location}</td>
                    <td className="px-4 py-3">
                      <Badge tone={event.isPublished ? "success" : "outline"}>
                        {event.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {event.isFeatured ? <Badge tone="accent">Featured</Badge> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Edit
                        </Link>

                        <form action={toggleEventPublished.bind(null, event.id, !event.isPublished)}>
                          <Button type="submit" variant="outline" size="sm">
                            {event.isPublished ? "Unpublish" : "Publish"}
                          </Button>
                        </form>

                        <form action={toggleEventFeatured.bind(null, event.id, !event.isFeatured)}>
                          <Button type="submit" variant="outline" size="sm">
                            {event.isFeatured ? "Unfeature" : "Feature"}
                          </Button>
                        </form>

                        <DeleteEventButton id={event.id} title={event.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
