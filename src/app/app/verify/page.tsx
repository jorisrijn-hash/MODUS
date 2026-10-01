"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/ui/Logo";
import { DEMO_OTP, completeVerification } from "@/lib/appDemo/session";

const CODE_LENGTH = DEMO_OTP.length;
const RESEND_SECONDS = 30;

export default function AppVerifyPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

  useEffect(() => {
    if (!verified) return;
    const id = window.setTimeout(() => {
      completeVerification();
      router.push("/app/overview");
    }, 900);
    return () => window.clearTimeout(id);
  }, [verified, router]);

  function setDigitAt(index: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function checkCode(code: string) {
    if (code.length < CODE_LENGTH) return;
    if (code === DEMO_OTP) {
      setError(false);
      setVerified(true);
    } else {
      setError(true);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
  }

  function handleChange(index: number, raw: string) {
    const value = raw.replace(/[^0-9]/g, "").slice(-1);
    setDigitAt(index, value);
    setError(false);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (value && index === CODE_LENGTH - 1) {
      const code = digits.slice(0, index).join("") + value;
      checkCode(code);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    setError(false);
    if (pasted.length === CODE_LENGTH) {
      checkCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  }

  function handleResend() {
    setCountdown(RESEND_SECONDS);
    setError(false);
    setDigits(Array(CODE_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm text-center"
      >
        <div className="flex justify-center">
          <Logo variant="symbol" tone="light" size="lg" />
        </div>

        <AnimatePresence mode="wait">
          {verified ? (
            <motion.div key="verified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <p className="mt-8 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-modus-light">
                <span className="h-1.5 w-1.5 rounded-full bg-modus-light" />
                Verified
              </p>
              <p className="mt-3 text-[14px] text-paper/60">Opening your business environment…</p>
            </motion.div>
          ) : (
            <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <h1 className="mt-8 text-[20px] font-semibold text-paper">Verify it&apos;s you.</h1>
              <p className="mt-2 text-[13.5px] text-paper/60">
                Enter the 6-digit code we sent to your email.
              </p>

              <div className="mt-7 flex items-center justify-center gap-2" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    aria-label={`Digit ${i + 1}`}
                    data-testid={`verify-digit-${i}`}
                    className="h-12 w-10 rounded-md border border-paper/15 bg-paper/[0.04] text-center text-[17px] font-medium text-paper outline-none transition-colors focus:border-modus-light"
                  />
                ))}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-[13px] text-signal"
                    role="alert"
                    data-testid="verify-error"
                  >
                    That code wasn&apos;t correct. Try again.
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="mt-6 text-[12.5px] text-paper/45">
                {countdown > 0 ? (
                  <>Resend code in {countdown}s</>
                ) : (
                  <button type="button" onClick={handleResend} className="text-paper/70 underline decoration-paper/30 underline-offset-4 hover:text-paper">
                    Resend code
                  </button>
                )}
              </p>

              <p className="mt-8 font-mono text-[9.5px] uppercase tracking-[0.06em] text-paper/25">
                Demo environment — the code is {DEMO_OTP}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
