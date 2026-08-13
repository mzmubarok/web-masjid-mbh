import Link from "next/link";
import {
  BookOpenText,
  CalendarDays,
  ChartNoAxesCombined,
  FileText,
  HandCoins,
  Image,
  ImagePlus,
  Images,
  LayoutDashboard,
  Settings,
  WalletCards,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Hero",
    href: "/admin/hero",
    icon: Image,
  },
  {
    label: "About",
    href: "/admin/about",
    icon: BookOpenText,
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: CalendarDays,
  },
  {
    label: "Gallery",
    href: "/admin/gallery",
    icon: Images,
  },
  {
    label: "Finance",
    href: "/admin/finance",
    icon: WalletCards,
  },
  {
    label: "Donations",
    href: "/admin/donations",
    icon: HandCoins,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: ImagePlus,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-lg font-semibold">
          Masjid Admin
        </span>
      </div>

      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-4" aria-hidden />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}