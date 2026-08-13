import Link from "next/link";

import { getEventCategories } from "@/lib/events/event-categories";
import { toggleEventCategoryActive } from "@/app/admin/events/categories/action";
import { EventCategoryForm } from "@/components/admin/EventCategoryForm";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function EventCategoriesPage() {
  const categories = await getEventCategories();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Event Categories
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Kelola kategori yang digunakan untuk mengelompokkan kegiatan masjid.
        </p>
      </div>

      <EventCategoryForm />

      <div className="rounded-lg border border-border bg-card">
        {categories.length === 0 ? (
          <p className="p-6 text-small text-muted-foreground">
            No event categories yet — create the first one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Slug</th>
                  <th scope="col" className="px-4 py-3 font-medium">Color</th>
                  <th scope="col" className="px-4 py-3 font-medium">Sort Order</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{category.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                    <td className="px-4 py-3">
                      {category.color ? (
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                          <span
                            aria-hidden
                            className="size-3.5 shrink-0 rounded-full border border-border"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.color}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{category.sortOrder}</td>
                    <td className="px-4 py-3">
                      <Badge tone={category.isActive ? "success" : "outline"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/events/categories/${category.id}/edit`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Edit
                        </Link>

                        <form action={toggleEventCategoryActive.bind(null, category.id, !category.isActive)}>
                          <Button type="submit" variant="outline" size="sm">
                            {category.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </form>

                        <DeleteCategoryButton id={category.id} name={category.name} />
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
