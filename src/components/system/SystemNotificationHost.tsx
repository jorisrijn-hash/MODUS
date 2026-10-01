"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { listenNotify, type SystemNotification } from "./notifications";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Mounted once near the root. Shows at most one lightweight system
 * notification at a time (section 30 of the brief): a mono label, a thin
 * rule, the message, auto-dismissed after a few seconds. Not a toast
 * library, deliberately minimal.
 */
export function SystemNotificationHost() {
  const [current, setCurrent] = useState<SystemNotification | null>(null);

  useEffect(() => {
    return listenNotify((notification) => {
      setCurrent(notification);
      const timer = window.setTimeout(() => {
        setCurrent((prev) => (prev?.id === notification.id ? null : prev));
      }, 3200);
      return () => window.clearTimeout(timer);
    });
  }, []);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.24, ease }}
          className="fixed bottom-6 left-1/2 z-[68] -translate-x-1/2 sm:bottom-8"
          role="status"
        >
          <div className="flex items-center gap-2.5 rounded-md border border-line bg-ink px-4 py-2.5 text-paper shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-modus-light" aria-hidden />
            {current.label && (
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper/50">
                {current.label}
              </span>
            )}
            <span className="text-[13px]">{current.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
