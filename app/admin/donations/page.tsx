import Link from "next/link";

import { getDonationPrograms } from "@/lib/donations/donation-programs";
import { toggleDonationProgramPublished, toggleDonationProgramFeatured } from "@/app/admin/donations/action";
import { DeleteDonationProgramButton } from "@/components/admin/DeleteDonationProgramButton";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function DonationProgramsPage() {
  const programs = await getDonationPrograms();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-heading">
            Donation Programs
          </h2>

          <p className="mt-2 text-body text-muted-foreground">
            Kelola program donasi yang ditampilkan di beranda.
          </p>
        </div>

        <Link href="/admin/donations/new" className={cn(buttonVariants({ variant: "primary" }))}>
          Create Program
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {programs.length === 0 ? (
          <p className="p-6 text-small text-muted-foreground">
            No donation programs yet — create the first one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Slug</th>
                  <th scope="col" className="px-4 py-3 font-medium">Display Order</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Featured</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3 font-medium text-foreground">{program.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{program.slug}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{program.displayOrder}</td>
                    <td className="px-4 py-3">
                      <Badge tone={program.isPublished ? "success" : "outline"}>
                        {program.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {program.isFeatured ? <Badge tone="accent">Featured</Badge> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/donations/${program.id}/edit`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Edit
                        </Link>

                        <form action={toggleDonationProgramPublished.bind(null, program.id, !program.isPublished)}>
                          <Button type="submit" variant="outline" size="sm">
                            {program.isPublished ? "Unpublish" : "Publish"}
                          </Button>
                        </form>

                        <form action={toggleDonationProgramFeatured.bind(null, program.id, !program.isFeatured)}>
                          <Button type="submit" variant="outline" size="sm">
                            {program.isFeatured ? "Unfeature" : "Feature"}
                          </Button>
                        </form>

                        <DeleteDonationProgramButton id={program.id} name={program.name} />
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
