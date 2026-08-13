import Link from "next/link";

import { getFinancialPrograms } from "@/lib/finance/financial-programs";
import { getMediaLibrary } from "@/lib/media/media";
import { toggleFinancialProgramActive, toggleFinancialProgramShowOnHomepage } from "@/app/admin/finance/action";
import { FinancialProgramForm } from "@/components/admin/FinancialProgramForm";
import { DeleteFinancialProgramButton } from "@/components/admin/DeleteFinancialProgramButton";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function FinancialProgramsPage() {
  const [programs, media] = await Promise.all([getFinancialPrograms(), getMediaLibrary()]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Financial Programs
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Kelola program keuangan yang digunakan untuk mengelompokkan laporan donasi masjid.
        </p>
      </div>

      <FinancialProgramForm media={media} />

      <div className="rounded-lg border border-border bg-card">
        {programs.length === 0 ? (
          <p className="p-6 text-small text-muted-foreground">
            No financial programs yet — create the first one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Slug</th>
                  <th scope="col" className="px-4 py-3 font-medium">Color</th>
                  <th scope="col" className="px-4 py-3 font-medium">Display Order</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Homepage</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3 font-medium text-foreground">{program.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{program.slug}</td>
                    <td className="px-4 py-3">
                      {program.color ? (
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                          <span
                            aria-hidden
                            className="size-3.5 shrink-0 rounded-full border border-border"
                            style={{ backgroundColor: program.color }}
                          />
                          {program.color}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{program.displayOrder}</td>
                    <td className="px-4 py-3">
                      <Badge tone={program.isActive ? "success" : "outline"}>
                        {program.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {program.showOnHomepage ? <Badge tone="accent">Shown</Badge> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/finance/${program.id}/edit`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Edit
                        </Link>

                        <form action={toggleFinancialProgramActive.bind(null, program.id, !program.isActive)}>
                          <Button type="submit" variant="outline" size="sm">
                            {program.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </form>

                        <form action={toggleFinancialProgramShowOnHomepage.bind(null, program.id, !program.showOnHomepage)}>
                          <Button type="submit" variant="outline" size="sm">
                            {program.showOnHomepage ? "Hide from Homepage" : "Show on Homepage"}
                          </Button>
                        </form>

                        <DeleteFinancialProgramButton id={program.id} name={program.name} />
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
