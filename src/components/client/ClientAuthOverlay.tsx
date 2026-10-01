"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { useDict } from "@/lib/i18n/context";
import { emailSchema } from "@/lib/diagnostic/schema";
import { startClientSession, type ClientSession } from "@/lib/clientAuth/session";

type Step = "email" | "otp" | "success";

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function ClientAuthOverlay({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (session: ClientSession) => void;
}) {
  const dict = useDict();
  const t = dict.clientAuth;
  const panelRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState("");
  const [resendIn, setResendIn] = useState(30);

  // Reset the flow whenever this transitions from closed to open, adjusted
  // during render (React's own pattern for "reset state on prop change")
  // rather than in an effect, so it lands before the opening paint instead
  // of one tick after.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep("email");
      setEmail("");
      setEmailError(null);
      setCode("");
      setCodeError(null);
    }
  }

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [step, resendIn]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open, step]);

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError(t.emailError);
      return;
    }
    setEmail(parsed.data);
    setDemoCode(randomCode());
    setResendIn(30);
    setCode("");
    setCodeError(null);
    setStep("otp");
  }

  function handleResend() {
    setDemoCode(randomCode());
    setResendIn(30);
    setCode("");
    setCodeError(null);
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setCodeError(t.otpError);
      return;
    }
    if (code !== demoCode) {
      setCodeError(t.otpWrongCode);
      return;
    }
    setStep("success");
    window.setTimeout(() => {
      onSuccess(startClientSession(email));
    }, 700);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            // Fixed regardless of site theme — a dimming scrim should
            // always dim toward black, not flip to a light wash under a
            // dark site theme the way bg-ink would now do. See
            // globals.css's --surface-inverted comment (Checkpoint 3).
            className="absolute inset-0 bg-inverted/30"
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={t.title}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm border border-line bg-paper outline-none"
          >
            <span className="reg-mark -left-1 -top-1" />
            <span className="reg-mark -right-1 -top-1" />
            <span className="reg-mark -bottom-1 -left-1" />
            <span className="reg-mark -bottom-1 -right-1" />

            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                MODUS / {t.title}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className="text-muted hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === "email" && (
                  <motion.form
                    key="email"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleEmailSubmit}
                  >
                    <p className="text-[15px] font-medium text-ink">{t.subtitle}</p>
                    <label className="mt-5 block">
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                        {t.emailLabel}
                      </span>
                      <input
                        type="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError(null);
                        }}
                        placeholder={t.emailPlaceholder}
                        className="mt-2 h-11 w-full border border-line bg-transparent px-3 text-[14px] text-ink outline-none focus:border-modus"
                      />
                    </label>
                    {emailError && <p className="mt-2 text-[12.5px] text-signal">{emailError}</p>}
                    <button
                      type="submit"
                      className="mt-5 flex w-full items-center justify-center gap-2 bg-modus py-3 text-[14px] font-medium text-modus-foreground transition-colors hover:bg-modus-light"
                    >
                      {t.continueButton}
                      <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </motion.form>
                )}

                {step === "otp" && (
                  <motion.form
                    key="otp"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleVerify}
                  >
                    <p className="text-[15px] font-medium text-ink">{t.otpTitle}</p>
                    <p className="mt-1 text-[12.5px] text-muted">{t.otpSubtitle(email)}</p>

                    <div className="mt-4 border border-dashed border-modus/40 bg-modus/5 px-3.5 py-2.5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-modus">
                        {t.demoBadge}
                      </p>
                      <p className="mt-1 text-[13px] text-graphite">{t.otpDemoNote(demoCode)}</p>
                    </div>

                    <label className="mt-5 block">
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                        {t.otpLabel}
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        autoFocus
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                          setCodeError(null);
                        }}
                        className="mt-2 h-11 w-full border border-line bg-transparent px-3 text-center font-mono text-[18px] tracking-[0.5em] text-ink outline-none focus:border-modus"
                      />
                    </label>
                    {codeError && <p className="mt-2 text-[12.5px] text-signal">{codeError}</p>}

                    <button
                      type="submit"
                      className="mt-5 flex w-full items-center justify-center gap-2 bg-modus py-3 text-[14px] font-medium text-modus-foreground transition-colors hover:bg-modus-light"
                    >
                      {t.verifyButton}
                    </button>

                    <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                      <button type="button" onClick={() => setStep("email")} className="hover:text-ink">
                        {t.changeEmail}
                      </button>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendIn > 0}
                        className="hover:text-ink disabled:opacity-40"
                      >
                        {resendIn > 0 ? t.resendIn(resendIn) : t.resend}
                      </button>
                    </div>
                  </motion.form>
                )}

                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-6 text-center"
                  >
                    <p className="text-[15px] font-medium text-modus">{t.successTitle}</p>
                    <p className="mt-1 text-[12.5px] text-muted">{t.successSubtitle}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
