"use client";

import { useClerk } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Gauge,
  FileText,
  Kanban,
  Settings,
  LogOut,
  RefreshCw,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import "./workspace.css";

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
  const [pending, startTransition] = useTransition();
  const [guideOpen, setGuideOpen] = useState(false);
  const { signOut } = useClerk();
  const activeLabel =
    navItems.find((item) =>
      item.href === "/private"
        ? pathname === item.href
        : pathname.startsWith(item.href),
    )?.label ?? "Workspace";

  function refresh() {
    window.dispatchEvent(new Event("modus:refresh"));
    startTransition(() => router.refresh());
  }

  return (
    <div className="modus-workspace min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1920px] grid-cols-[minmax(0,1fr)] md:grid-cols-[184px_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-line bg-mineral md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
          <Link
            href="/private"
            className="flex items-center gap-3 px-5 py-6"
            aria-label="MODUS workspace overview"
          >
            <LogoMark className="h-7 w-7 text-modus" />
            <span className="text-sm font-semibold tracking-[.14em]">
              MODUS
              <span className="mt-1 block text-[9px] font-normal tracking-[.12em] text-muted">
                OPERATIONS
              </span>
            </span>
          </Link>
          <nav
            aria-label="Admin navigation"
            className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col"
          >
            {navItems.map(({ label, href, icon: Icon }) => {
              const active =
                href === "/private"
                  ? pathname === href
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors ${active ? "bg-surface-elevated text-ink" : "text-muted hover:bg-surface hover:text-ink"}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden px-5 md:absolute md:bottom-6 md:block">
            <p className="workspace-eyebrow">Human review, informed.</p>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-xs text-muted hover:text-ink"
            >
              Public site
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 lg:px-8">
            <p className="text-xs text-muted">
              Workspace <span className="mx-2 text-line-strong">/</span>
              <span className="text-ink">{activeLabel}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGuideOpen(!guideOpen)}
                aria-expanded={guideOpen}
                aria-controls="workspace-guide"
                className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs text-graphite hover:bg-surface"
              >
                <BookOpen className="h-4 w-4" />
                Review guide
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={refresh}
                className="flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 text-xs text-graphite disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {pending ? "Refreshing…" : "Refresh"}
              </button>
              <details className="relative">
                <summary
                  aria-label="Account menu"
                  className="flex h-10 w-10 list-none items-center justify-center rounded-full border border-line bg-surface font-mono text-xs"
                >
                  {username.slice(0, 1).toUpperCase()}
                </summary>
                <div className="absolute right-0 top-12 z-30 w-64 rounded-xl border border-line bg-surface p-3 shadow-xl">
                  <p className="break-words border-b border-line pb-3 text-sm">
                    {username}
                  </p>
                  <Link
                    href="/private/settings"
                    className="mt-2 block p-2 text-xs text-graphite"
                  >
                    Account & system
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="flex min-h-10 w-full items-center gap-2 p-2 text-xs text-graphite"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </details>
            </div>
          </header>
          {guideOpen && (
            <section
              id="workspace-guide"
              className="mx-5 mt-5 rounded-xl border border-line bg-surface p-5 lg:mx-8"
            >
              <h2 className="text-sm font-medium">
                From an answer to a useful next step.
              </h2>
              <ol className="mt-3 grid gap-4 text-xs leading-relaxed text-graphite sm:grid-cols-3">
                <li>
                  <strong className="text-ink">01 / Read the evidence.</strong>
                  <br />
                  Start with the submitter’s own words. Signals are rule-based
                  prompts, not verified findings.
                </li>
                <li>
                  <strong className="text-ink">
                    02 / Validate the constraint.
                  </strong>
                  <br />
                  Use the review brief to ask about frequency, ownership and
                  impact. Record what you learn in a note.
                </li>
                <li>
                  <strong className="text-ink">
                    03 / Make the next step visible.
                  </strong>
                  <br />
                  Update the workflow after taking action. A status change
                  records progress; it does not send an email.
                </li>
              </ol>
            </section>
          )}
          <main className="p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
