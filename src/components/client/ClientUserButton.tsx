"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, LogOut } from "lucide-react";
import { useDict } from "@/lib/i18n/context";
import { useClientSession, endClientSession } from "@/lib/clientAuth/session";
import { ClientAuthOverlay } from "@/components/client/ClientAuthOverlay";

export function ClientUserButton({
  className = "",
  variant = "nav",
}: {
  className?: string;
  variant?: "nav" | "mobile";
}) {
  const dict = useDict();
  const t = dict.clientAuth;
  const session = useClientSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  if (!session) {
    return (
      <>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className={
            variant === "mobile"
              ? `flex w-full items-center gap-2 border-b border-line py-3.5 text-left text-[15px] text-graphite ${className}`
              : `inline-flex items-center gap-1.5 text-[13px] text-graphite transition-colors hover:text-ink ${className}`
          }
        >
          <User className="h-4 w-4" strokeWidth={1.75} />
          {t.signIn}
        </button>
        <ClientAuthOverlay open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />
      </>
    );
  }

  if (variant === "mobile") {
    return (
      <div className={`border-b border-line py-3.5 ${className}`}>
        <p className="text-[15px] text-graphite">{session.company ?? session.name}</p>
        <p className="mt-0.5 text-[12px] text-muted">
          {t.signedInAs} {session.email}
        </p>
        <button
          type="button"
          onClick={() => endClientSession()}
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-signal"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          {t.signOut}
        </button>
      </div>
    );
  }

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={t.accountMenu}
        aria-expanded={menuOpen}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper"
      >
        <span className="font-mono text-[11px] uppercase">{session.name.slice(0, 1)}</span>
      </button>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-20 w-56 border border-line bg-paper p-2 shadow-lg"
          >
            <div className="border-b border-line px-2 pb-2">
              <p className="text-[13px] font-medium text-ink">{session.company ?? session.name}</p>
              <p className="mt-0.5 text-[11.5px] text-muted">
                {t.signedInAs} {session.email}
              </p>
              <p className="mt-1.5 inline-block border border-modus/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-modus">
                {t.demoBadge}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                endClientSession();
                setMenuOpen(false);
              }}
              className="mt-1 flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-[13px] text-signal hover:bg-mineral"
            >
              <LogOut className="h-3 w-3" strokeWidth={1.75} />
              {t.signOut}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
