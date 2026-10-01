"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Gauge, FileText, Kanban, Settings, LogOut } from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/Logo";

const navItems = [
  { label: "Overview", href: "/private", icon: Gauge },
  { label: "Diagnostics", href: "/private/diagnostics", icon: FileText },
  { label: "Pipeline", href: "/private/pipeline", icon: Kanban },
  { label: "Settings", href: "/private/settings", icon: Settings },
];

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/private/logout", { method: "POST" });
    router.push("/private/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-mineral">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
        <aside className="border-b border-line bg-white md:min-h-screen md:border-b-0 md:border-r">
          <div className="p-5">
            <Logo variant="wordmark" size="sm" />
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
              Private
            </p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-5">
            {navItems.map((item) => {
              const active =
                item.href === "/private" ? pathname === "/private" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-2.5 rounded px-3 py-2.5 text-[13px] transition-colors ${
                    active ? "bg-ink text-paper" : "text-graphite hover:bg-mineral"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div>
          <header className="flex items-center justify-between border-b border-line bg-white px-6 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              MODUS / Private
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper"
                aria-label="Account menu"
              >
                <span className="font-mono text-[11px] uppercase">{username.slice(0, 1)}</span>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 z-20 w-52 rounded-md border border-line bg-white p-2 shadow-lg"
                  >
                    <div className="flex items-center gap-2 border-b border-line px-2 pb-2">
                      <LogoMark className="h-3.5 w-3.5" />
                      <span className="text-[13px] font-medium text-ink">{username}</span>
                    </div>
                    <Link
                      href="/private/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-1 block rounded px-2 py-1.5 text-[13px] text-graphite hover:bg-mineral"
                    >
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-[13px] text-signal hover:bg-mineral"
                    >
                      <LogOut className="h-3 w-3" strokeWidth={1.75} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          <main className="p-6 md:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
