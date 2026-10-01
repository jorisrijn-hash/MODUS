"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { SystemSurface } from "@/components/system/SystemSurface";
import { useOverlaySlot } from "@/components/system/OverlayProvider";
import { useDict } from "@/lib/i18n/context";
import { track } from "@/lib/chatbot";

export function DiagnosticRecoveryPrompt({
  visible,
  onContinue,
  onStartAgain,
  onDismiss,
}: {
  visible: boolean;
  onContinue: () => void;
  onStartAgain: () => void;
  onDismiss: () => void;
}) {
  const dict = useDict();
  const [confirming, setConfirming] = useState(false);
  const active = useOverlaySlot("diagnosticRecovery", visible);

  function dismiss() {
    track("diagnostic_resumed", { action: "dismiss" });
    setConfirming(false);
    onDismiss();
  }

  function startOver() {
    track("diagnostic_resumed", { action: "start_again" });
    setConfirming(false);
    onStartAgain();
  }

  return (
    <AnimatePresence>
      {active && (
        <SystemSurface
          label={dict.diagnosticRecovery.label}
          onClose={dismiss}
          closeLabel={dict.diagnosticRecovery.dismiss}
        >
          {!confirming ? (
            <>
              <p className="text-[13.5px] leading-relaxed text-graphite">
                {dict.diagnosticRecovery.body}
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    track("diagnostic_resumed", { action: "continue" });
                    onContinue();
                  }}
                  className="rounded bg-modus px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-modus-light"
                >
                  {dict.diagnosticRecovery.continueDiagnostic}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="rounded border border-line px-3.5 py-2 text-[13px] text-graphite transition-colors hover:border-modus hover:text-modus"
                >
                  {dict.diagnosticRecovery.startAgain}
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="px-1 text-[13px] text-muted underline decoration-1 underline-offset-4 transition-colors hover:text-ink"
                >
                  {dict.diagnosticRecovery.dismiss}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13.5px] font-medium text-ink">
                {dict.diagnosticRecovery.confirmTitle}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-graphite">
                {dict.diagnosticRecovery.confirmBody}
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={startOver}
                  className="rounded bg-signal px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:opacity-90"
                >
                  {dict.diagnosticRecovery.confirmAction}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded border border-line px-3.5 py-2 text-[13px] text-graphite transition-colors hover:border-modus hover:text-modus"
                >
                  {dict.diagnosticRecovery.confirmCancel}
                </button>
              </div>
            </>
          )}
        </SystemSurface>
      )}
    </AnimatePresence>
  );
}
