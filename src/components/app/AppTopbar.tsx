"use client";

import { Search, Menu } from "lucide-react";
import { DEMO_CLIENT } from "@/lib/appDemo/data";

export function AppTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-4 backdrop-blur sm:px-6 md:pl-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-8 w-8 items-center justify-center rounded-md text-graphite transition-colors hover:bg-surface md:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{DEMO_CLIENT.name}</p>
      </div>
      <button
        type="button"
        onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
        className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-[12px] text-muted transition-colors hover:border-ink/30 hover:text-graphite"
      >
        <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-1 hidden rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
