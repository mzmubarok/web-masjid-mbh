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
  Share2,
  WalletCards,
} from "lucide-react";

export const navigation = [
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
    label: "Social Media",
    href: "/admin/social-media",
    icon: Share2,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export interface AdminNavLinksProps {
  /** Called after a nav item is clicked — used by the mobile drawer to close itself. No-op on desktop. */
  onNavigate?: () => void;
}

/** The admin nav item list — shared by the desktop sidebar and the mobile drawer so they can never drift apart. */
export function AdminNavLinks({ onNavigate }: AdminNavLinksProps) {
  return (
    <nav className="space-y-1 p-4">
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon className="size-4" aria-hidden />

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
