import type { ReactNode } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}