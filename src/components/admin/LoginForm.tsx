"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { LogoMark } from "@/components/ui/Logo";
import { ArrowRight } from "lucide-react";

type Status = "idle" | "verifying" | "verified" | "error";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("verifying");
    setError(null);

    try {
      const res = await fetch("/api/private/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid credentials.");
        setStatus("error");
        return;
      }

      setStatus("verified");
      window.setTimeout(() => {
        router.push("/private");
        router.refresh();
      }, 600);
    } catch {
      setError("Something went wrong. Try again.");
      setStatus("error");
    }
  }

  const label =
    status === "verifying" ? "Verifying" : status === "verified" ? "Access Verified" : "Sign In";

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <LogoMark tone="invert" className="h-8 w-8" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50">
              MODUS / Private Access
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-paper">Private access.</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-paper/50">
              Username
            </span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-2 h-[50px] w-full rounded border border-paper/15 bg-transparent px-3.5 text-[14px] text-paper outline-none focus:border-modus-light"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-paper/50">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 h-[50px] w-full rounded border border-paper/15 bg-transparent px-3.5 text-[14px] text-paper outline-none focus:border-modus-light"
            />
          </label>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[13px] text-signal"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={status === "verifying" || status === "verified"}
            className="flex w-full items-center justify-center gap-2 rounded bg-modus py-3.5 text-[14px] font-medium text-paper transition-colors hover:bg-modus-light disabled:opacity-70"
          >
            {label}
            {status === "idle" && <ArrowRight className="h-4 w-4" strokeWidth={1.75} />}
          </button>
        </form>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-paper/30">
          Authorized access only
        </p>
      </div>
    </div>
  );
}
