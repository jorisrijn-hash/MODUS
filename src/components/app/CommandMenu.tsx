"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/appDemo/session";
import { NAV_PRIMARY, NAV_SECONDARY } from "@/lib/appDemo/navItems";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const PAGES = [...NAV_PRIMARY, ...NAV_SECONDARY];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" data-testid="app-command-menu">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-lg border border-line bg-paper shadow-2xl"
          >
            <Command label="Command Menu" shouldFilter>
              <div className="border-b border-line px-4 py-3">
                <Command.Input
                  autoFocus
                  placeholder="Search pages and actions…"
                  className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-muted"
                />
              </div>
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="px-3 py-6 text-center text-[13px] text-muted">
                  No results found.
                </Command.Empty>
                <Command.Group
                  heading="Pages"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-muted"
                >
                  {PAGES.map((page) => {
                    const Icon = page.icon;
                    return (
                      <Command.Item
                        key={page.href}
                        value={page.label}
                        onSelect={() => go(page.href)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] text-graphite data-[selected=true]:bg-surface data-[selected=true]:text-ink"
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                        {page.label}
                      </Command.Item>
                    );
                  })}
                </Command.Group>
                <Command.Group
                  heading="Account"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-muted"
                >
                  <Command.Item
                    value="Sign out"
                    onSelect={() => {
                      setOpen(false);
                      signOut();
                      router.push("/app/login");
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] text-graphite data-[selected=true]:bg-surface data-[selected=true]:text-ink"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    Sign out
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
