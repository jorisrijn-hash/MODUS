"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, Phone, MessageCircle, Mail } from "lucide-react";
import { PageHeader } from "@/components/app/ui/PageHeader";
import { AppCard, AppCardHeader } from "@/components/app/ui/AppCard";
import { SUPPORT_CHAT_DEMO, SIGNALS } from "@/lib/appDemo/data";

export default function SupportPage() {
  const [messages, setMessages] = useState(SUPPORT_CHAT_DEMO);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "modus",
          text: "That's noted — in the full MODUS environment this would be answered using your business's live data. For this demo, try the question above to see a real example.",
        },
      ]);
    }, 1100);
  }

  return (
    <div>
      <PageHeader title="Talk to MODUS" subtitle="Ask a question about your business." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <AppCard padded={false} className="flex h-[480px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
            {messages.map((m, i) => {
              const signal = m.signalId ? SIGNALS.find((s) => s.id === m.signalId) : undefined;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2.5 text-[13.5px] leading-relaxed ${
                      m.role === "user" ? "bg-ink text-paper" : "border border-line bg-mineral text-graphite"
                    }`}
                  >
                    {m.text}
                    {signal && (
                      <Link
                        href="/app/signals"
                        className="mt-2 flex items-center gap-1 text-[12px] font-medium text-modus hover:underline"
                      >
                        View signal →
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
            <AnimatePresence>
              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-lg border border-line bg-mineral px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask MODUS a question…"
              className="flex-1 rounded-md border border-line bg-paper px-3.5 py-2.5 text-[13.5px] text-ink outline-none placeholder:text-muted focus:border-ink/30"
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-paper transition-colors hover:bg-graphite"
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </AppCard>

        <AppCard>
          <AppCardHeader title="Other ways to reach us" />
          <div className="mt-4 space-y-2">
            <button className="flex w-full items-center gap-3 rounded-md border border-line px-3.5 py-3 text-left text-[13px] text-graphite transition-colors hover:border-ink/30">
              <MessageCircle className="h-4 w-4 text-modus" strokeWidth={1.75} /> Message MODUS
            </button>
            <button className="flex w-full items-center gap-3 rounded-md border border-line px-3.5 py-3 text-left text-[13px] text-graphite transition-colors hover:border-ink/30">
              <Phone className="h-4 w-4 text-modus" strokeWidth={1.75} /> Book a call
            </button>
            <button className="flex w-full items-center gap-3 rounded-md border border-line px-3.5 py-3 text-left text-[13px] text-graphite transition-colors hover:border-ink/30">
              <Mail className="h-4 w-4 text-modus" strokeWidth={1.75} /> WhatsApp
            </button>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
