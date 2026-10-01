"use client";

import Link from "next/link";
import { NAV_PRIMARY, NAV_SECONDARY } from "@/lib/appDemo/navItems";

export function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <ul className="space-y-0.5">
        {NAV_PRIMARY.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors ${
                  active ? "bg-ink text-paper" : "text-graphite hover:bg-surface"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <ul className="mt-4 space-y-0.5 border-t border-line pt-4">
        {NAV_SECONDARY.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors ${
                  active ? "bg-ink text-paper" : "text-graphite hover:bg-surface"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
