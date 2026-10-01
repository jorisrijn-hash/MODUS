"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { X } from "lucide-react";
import { useDict } from "@/lib/i18n/context";
import { getConsent, saveConsent } from "@/lib/privacy/consent";
import { track } from "@/lib/chatbot";
import { notify } from "@/components/system/notifications";

const ease = [0.16, 1, 0.3, 1] as const;

function ToggleRow({
  label,
  description,
  status,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  status?: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-4 last:border-b-0">
      <div>
        <p className="text-[14px] font-medium text-ink">{label}</p>
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">{description}</p>
      </div>
      {disabled ? (
        <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-modus">
          {status}
        </span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange?.(!checked)}
          className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
            checked ? "border-modus bg-modus" : "border-line bg-surface"
          }`}
        >
          <span
            className={`h-4.5 w-4.5 rounded-full bg-paper shadow transition-transform ${
              checked ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      )}
    </div>
  );
}

export function ConsentPreferencesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dict = useDict();
  const reduceMotion = useReducedMotion();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Re-read the persisted decision each time the dialog opens (not just on
  // mount, since Root stays mounted between opens). This is the "adjust
  // state when a prop changes" pattern done during render rather than in
  // an effect, per https://react.dev/learn/you-might-not-need-an-effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const existing = getConsent();
      setAnalytics(existing?.categories.analytics ?? false);
      setMarketing(existing?.categories.marketing ?? false);
    }
  }

  function handleSave() {
    const state = saveConsent({ analytics, marketing });
    track("privacy_preferences_changed", { source: "preferences_dialog", ...state.categories });
    notify(dict.privacy.savedNotification);
    onOpenChange(false);
  }

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
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="fixed inset-0 z-[80] bg-inverted/30"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: reduceMotion ? 0 : 0.28, ease }}
                className="fixed inset-x-4 bottom-4 top-auto z-[81] mx-auto max-w-md rounded-md border border-line bg-paper shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:bottom-auto"
              >
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <Dialog.Title className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    {dict.privacy.preferencesTitle}
                  </Dialog.Title>
                  <Dialog.Close
                    aria-label={dict.common.close}
                    className="flex h-7 w-7 items-center justify-center text-muted hover:text-ink"
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </Dialog.Close>
                </div>

                <div className="px-5 py-4">
                  <p className="text-[13.5px] leading-relaxed text-graphite">
                    {dict.privacy.preferencesIntro}
                  </p>

                  <div className="mt-3">
                    <ToggleRow
                      label={dict.privacy.necessaryLabel}
                      description={dict.privacy.necessaryDescription}
                      status={dict.privacy.necessaryStatus}
                      checked
                      disabled
                    />
                    <ToggleRow
                      label={dict.privacy.analyticsLabel}
                      description={dict.privacy.analyticsDescription}
                      checked={analytics}
                      onChange={setAnalytics}
                    />
                    <ToggleRow
                      label={dict.privacy.marketingLabel}
                      description={dict.privacy.marketingDescription}
                      checked={marketing}
                      onChange={setMarketing}
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                    <a href="#" className="hover:text-ink">
                      {dict.privacy.privacyPolicyLink}
                    </a>
                    <a href="#" className="hover:text-ink">
                      {dict.privacy.cookiePolicyLink}
                    </a>
                  </div>
                </div>

                <div className="flex justify-end border-t border-line px-5 py-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded bg-modus px-4 py-2 text-[13px] font-medium text-modus-foreground transition-colors hover:bg-modus-light"
                  >
                    {dict.common.save}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
