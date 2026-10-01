"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/ui/Logo";
import { NavList } from "@/components/app/NavList";
import { DEMO_CLIENT } from "@/lib/appDemo/data";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-paper md:flex">
      <Link href="/app/overview" className="flex items-center gap-2.5 border-b border-line px-5 py-5">
        <LogoMark tone="dark" className="h-6 w-6 shrink-0" />
        <span className="font-sans text-[13.5px] font-semibold uppercase tracking-[0.1em] text-ink">
          MODUS
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavList pathname={pathname} />
      </nav>

      <div className="border-t border-line px-3 py-4">
        <div className="flex items-center gap-2.5 px-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-modus text-[11px] font-medium text-paper">
            {DEMO_CLIENT.contactName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-ink">{DEMO_CLIENT.contactName}</p>
            <p className="truncate text-[11px] text-muted">{DEMO_CLIENT.name}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
