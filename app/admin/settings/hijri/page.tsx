import Link from "next/link";

import { getHijriOverrides } from "@/lib/hijri/hijri-overrides";
import { HijriOverrideForm } from "@/components/admin/HijriOverrideForm";
import { DeleteHijriOverrideButton } from "@/components/admin/DeleteHijriOverrideButton";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Stored as UTC midnight (see lib/date.ts) — format in UTC so the displayed
// calendar date always matches what was picked, regardless of server timezone.
const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" });

export default async function HijriOverridesPage() {
  const overrides = await getHijriOverrides();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Hijri Overrides
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Kelola koreksi tanggal Hijriah untuk tanggal Masehi tertentu. Override selalu
          diprioritaskan di atas perhitungan otomatis.
        </p>
      </div>

      <HijriOverrideForm />

      <div className="rounded-lg border border-border bg-card">
        {overrides.length === 0 ? (
          <p className="p-6 text-small text-muted-foreground">
            No Hijri overrides have been created yet — create the first one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Gregorian Date</th>
                  <th scope="col" className="px-4 py-3 font-medium">Hijri Date</th>
                  <th scope="col" className="px-4 py-3 font-medium">Source</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {overrides.map((override) => {
                  const gregorianLabel = dateFormatter.format(override.gregorianDate);

                  return (
                    <tr key={override.id} className="border-b border-border last:border-0 align-top">
                      <td className="px-4 py-3 font-medium text-foreground">{gregorianLabel}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {override.hijriDay}/{override.hijriMonth}/{override.hijriYear} H
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{override.source ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/settings/hijri/${override.id}/edit`}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                          >
                            Edit
                          </Link>

                          <DeleteHijriOverrideButton id={override.id} label={gregorianLabel} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
