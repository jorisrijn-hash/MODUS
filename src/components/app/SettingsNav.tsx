"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app/settings", label: "Business" },
  { href: "/app/settings/integrations", label: "Integrations" },
  { href: "/app/settings/billing", label: "Billing" },
  { href: "/app/settings/account", label: "Account" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex gap-1 border-b border-line">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors ${
              active ? "border-ink text-ink" : "border-transparent text-muted hover:text-graphite"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
