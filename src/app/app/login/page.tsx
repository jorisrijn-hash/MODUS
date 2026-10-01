"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { startLogin } from "@/lib/appDemo/session";

export default function AppLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function proceedToVerify() {
    setSubmitting(true);
    startLogin();
    window.setTimeout(() => router.push("/app/verify"), 500);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    proceedToVerify();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center">
          <Logo variant="symbol" tone="light" size="lg" />
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-[22px] font-semibold text-paper">Welcome back.</h1>
          <p className="mt-2 text-[13.5px] text-paper/60">Sign in to your business environment.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.08em] text-paper/50">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-2 w-full rounded-md border border-paper/15 bg-paper/[0.04] px-3.5 py-2.5 text-[14px] text-paper outline-none transition-colors placeholder:text-paper/30 focus:border-modus-light"
            />
          </div>
          <div>
            <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[0.08em] text-paper/50">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-md border border-paper/15 bg-paper/[0.04] px-3.5 py-2.5 text-[14px] text-paper outline-none transition-colors placeholder:text-paper/30 focus:border-modus-light"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-modus-light px-4 py-2.5 text-[13.5px] font-medium text-paper transition-colors duration-200 ease-modus hover:bg-modus disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
            {!submitting && <ArrowRight className="h-4 w-4" strokeWidth={1.75} />}
          </button>
        </form>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-paper/10" />
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-paper/35">or</span>
          <div className="h-px flex-1 bg-paper/10" />
        </div>

        <button
          type="button"
          onClick={proceedToVerify}
          disabled={submitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-paper/15 px-4 py-2.5 text-[13.5px] font-medium text-paper/85 transition-colors hover:border-paper/30 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-[12.5px] text-paper/40">
          <button type="button" className="hover:text-paper/70">
            Forgot password?
          </button>
        </p>

        <p className="mt-8 text-center font-mono text-[9.5px] uppercase tracking-[0.06em] text-paper/25">
          Demo environment — any email and password will sign in
        </p>
      </motion.div>
    </div>
  );
}
