import {
  LayoutDashboard,
  TrendingUp,
  Radio,
  Kanban,
  Users,
  Globe,
  Megaphone,
  FileText,
  Settings,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_PRIMARY: NavItem[] = [
  { href: "/app/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/app/performance", label: "Performance", icon: TrendingUp },
  { href: "/app/signals", label: "Signals", icon: Radio },
  { href: "/app/actions", label: "Actions", icon: Kanban },
  { href: "/app/leads", label: "Leads", icon: Users },
  { href: "/app/website", label: "Website", icon: Globe },
  { href: "/app/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/app/reports", label: "Reports", icon: FileText },
];

export const NAV_SECONDARY: NavItem[] = [
  { href: "/app/settings", label: "Settings", icon: Settings },
  { href: "/app/support", label: "Support", icon: LifeBuoy },
];
