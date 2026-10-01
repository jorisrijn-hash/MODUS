"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode } from "react";
import { X } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const ease = [0.16, 1, 0.3, 1] as const;

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.1 : 0.25 }}
                className="fixed inset-0 z-40 bg-ink/40"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                initial={reducedMotion ? { opacity: 0 } : { x: "100%" }}
                animate={reducedMotion ? { opacity: 1 } : { x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { x: "100%" }}
                transition={{ duration: reducedMotion ? 0.15 : 0.35, ease }}
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-paper shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-line px-6 py-5">
                  <Dialog.Title className="text-[15px] font-medium text-ink">{title}</Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Close"
                      className="rounded p-1 text-muted transition-colors hover:bg-surface hover:text-ink"
                    >
                      <X className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </Dialog.Close>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
