"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import {
  matchRule,
  getFallbackResponse,
  getFallbackChips,
  getQuickReplies,
  listenChatbotOpen,
  notifyChatbotState,
  track,
  type ChatAction,
} from "@/lib/chatbot";
import { useDict, useLocale } from "@/lib/i18n/context";

type Message = {
  id: string;
  from: "user" | "modus";
  text: string;
  time: string;
  actions?: ChatAction[];
};

function now() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

export function Chatbot() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const dict = useDict();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    return listenChatbotOpen(() => {
      setOpen(true);
      track("chat_open", { source: "external_cta" });
      window.setTimeout(() => inputRef.current?.focus(), 300);
    });
  }, []);

  useEffect(() => {
    notifyChatbotState(open);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = window.innerWidth < 640 ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next) track("chat_open", { source: "trigger" });
      return next;
    });
  }

  function respond(userText: string) {
    setTyping(true);
    const rule = matchRule(userText, locale);
    window.setTimeout(
      () => {
        setTyping(false);
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            from: "modus",
            text: rule ? rule.response : getFallbackResponse(locale),
            time: now(),
            actions: rule?.actions,
          },
        ]);
      },
      500
    );
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { id: nextId(), from: "user", text: trimmed, time: now() }]);
    setInput("");
    track("chat_message", { text: trimmed });
    respond(trimmed);
  }

  const hasMessages = messages.length > 0;

  // The public marketing chatbot has no place on the internal admin console.
  if (pathname?.startsWith("/private")) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            // Fixed regardless of site theme — a dimming scrim behind a
            // modal-like panel should always dim toward black, not flip
            // to a light wash under a dark site theme the way bg-ink
            // would now do. See globals.css's --surface-inverted comment.
            className="fixed inset-0 z-[65] bg-inverted/20 sm:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        layoutId="modus-chatbot-shell"
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 320, damping: 32, mass: 0.9 }
        }
        className={`fixed z-[70] overflow-hidden border border-line bg-paper shadow-2xl ${
          open
            ? "inset-x-3 bottom-3 top-16 rounded-md sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:h-[600px] sm:max-h-[80vh] sm:w-[400px] sm:rounded-md"
            : "bottom-5 right-5 h-12 w-12 rounded-full sm:h-14 sm:w-14"
        }`}
      >
        {!open ? (
          <button
            type="button"
            onClick={toggleOpen}
            aria-label={dict.chatbot.openLabel}
            className="flex h-full w-full items-center justify-center bg-modus transition-colors hover:bg-modus-light"
          >
            <LogoMark tone="invert" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-modus">
                  <LogoMark tone="invert" className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink">{dict.chatbot.name}</p>
                  <p className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.08em] text-modus">
                    <span className="h-1.5 w-1.5 rounded-full bg-modus" aria-hidden />
                    {dict.chatbot.available}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.chatbot.closeLabel}
                className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {!hasMessages && (
                <div>
                  <p className="text-[15px] font-medium text-ink">{dict.chatbot.introTitle}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {dict.chatbot.introBody}
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    {getQuickReplies(locale).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => send(q)}
                        className="rounded-sm border border-line px-3 py-2 text-left text-[13px] text-graphite transition-colors hover:border-modus hover:text-modus"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={msg.from === "user" ? "flex justify-end" : ""}>
                  <div className={msg.from === "user" ? "max-w-[85%]" : "max-w-[90%]"}>
                    <p
                      className={`font-mono text-[9px] uppercase tracking-[0.06em] text-muted ${
                        msg.from === "user" ? "text-right" : ""
                      }`}
                    >
                      {msg.from === "user"
                        ? `${dict.chatbot.you} / ${msg.time}`
                        : `${dict.chatbot.name} / ${msg.time}`}
                    </p>
                    <div
                      className={`mt-1 rounded-sm px-3 py-2.5 text-[13.5px] leading-relaxed ${
                        msg.from === "user"
                          ? "bg-mineral text-ink"
                          : "border border-line text-graphite"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.actions && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.actions.map((action) => (
                          <Link
                            key={action.label}
                            href={action.href}
                            className="rounded-sm border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-graphite transition-colors hover:border-modus hover:text-modus"
                          >
                            {action.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
                    {dict.chatbot.name} / {now()}
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1 rounded-sm border border-line px-3 py-2.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                        className="h-1 w-1 rounded-full bg-muted"
                      />
                    ))}
                  </div>
                </div>
              )}

              {hasMessages && !typing && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {getFallbackChips(locale).slice(0, 4).map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => send(chip)}
                      className="rounded-sm border border-line px-2.5 py-1 text-[11.5px] text-muted transition-colors hover:border-modus hover:text-modus"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-line p-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={dict.chatbot.inputPlaceholder}
                className="min-w-0 flex-1 rounded-sm border border-line bg-paper px-3 py-2 text-[13.5px] text-ink outline-none placeholder:text-muted focus:border-modus"
              />
              <button
                type="submit"
                aria-label={dict.chatbot.send}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-ink text-paper transition-colors hover:bg-graphite"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </>
  );
}
