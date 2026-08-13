import { AdminNavLinks } from "@/components/admin/AdminNavLinks";

/** Desktop navigation — hidden below `md`; `AdminMobileNav` covers narrower viewports with the same nav data. */
export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-lg font-semibold">
          Masjid Admin
        </span>
      </div>

      <AdminNavLinks />
    </aside>
  );
}
