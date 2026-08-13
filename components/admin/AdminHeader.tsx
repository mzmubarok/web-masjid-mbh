import { auth } from "@/auth";

import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { LogoutButton } from "@/components/admin/LogoutButton";

export async function AdminHeader() {
  const session = await auth();

  const user = session?.user;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <AdminMobileNav />

        <h1 className="text-h4 font-heading text-heading">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-small font-medium text-foreground">
            {user?.name ?? "Administrator"}
          </p>

          <p className="text-xs text-muted-foreground">
            {user?.role ?? "Admin"}
          </p>
        </div>

        <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {(user?.name?.charAt(0) ?? "A").toUpperCase()}
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}