import type { Locale } from "@/lib/i18n/config";
import {
  chatRulesEn,
  fallbackChipsEn,
  fallbackResponseEn,
  quickRepliesEn,
} from "@/lib/i18n/dictionaries/en";
import {
  chatRulesNl,
  fallbackChipsNl,
  fallbackResponseNl,
  quickRepliesNl,
} from "@/lib/i18n/dictionaries/nl";

export type ChatAction = { label: string; href: string };

export type ChatRule = {
  id: string;
  keywords: string[];
  response: string;
  actions?: ChatAction[];
};

// Rule content lives in the locale dictionaries (src/lib/i18n/dictionaries)
// so the chatbot switches language along with the rest of the site. Swap
// these lookups for an API/LLM/CRM call later without touching the chat UI.
export function getChatRules(locale: Locale): ChatRule[] {
  return locale === "nl" ? chatRulesNl : chatRulesEn;
}

export function getFallbackResponse(locale: Locale): string {
  return locale === "nl" ? fallbackResponseNl : fallbackResponseEn;
}

export function getFallbackChips(locale: Locale): string[] {
  return locale === "nl" ? fallbackChipsNl : fallbackChipsEn;
}

export function getQuickReplies(locale: Locale): string[] {
  return locale === "nl" ? quickRepliesNl : quickRepliesEn;
}

export function matchRule(input: string, locale: Locale): ChatRule | null {
  const normalized = input.toLowerCase();
  for (const rule of getChatRules(locale)) {
    if (rule.keywords.some((kw) => normalized.includes(kw))) return rule;
  }
  return null;
}

const CHAT_OPEN_EVENT = "modus:chat:open";
const CHAT_STATE_EVENT = "modus:chat:state";

export function openChatbot(prefill?: string) {
  window.dispatchEvent(new CustomEvent(CHAT_OPEN_EVENT, { detail: { prefill } }));
}

export function listenChatbotOpen(cb: (prefill?: string) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail?.prefill);
  window.addEventListener(CHAT_OPEN_EVENT, handler);
  return () => window.removeEventListener(CHAT_OPEN_EVENT, handler);
}

/** Broadcast whether the chatbot panel is currently expanded, so the system
 * overlay manager can suppress the passive language suggestion while a
 * visitor is mid-conversation. */
export function notifyChatbotState(open: boolean) {
  window.dispatchEvent(new CustomEvent(CHAT_STATE_EVENT, { detail: { open } }));
}

export function listenChatbotState(cb: (open: boolean) => void) {
  const handler = (e: Event) => cb(Boolean((e as CustomEvent).detail?.open));
  window.addEventListener(CHAT_STATE_EVENT, handler);
  return () => window.removeEventListener(CHAT_STATE_EVENT, handler);
}

// Clean analytics hooks, no-op until a provider is wired in.
export function track(event: string, payload?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${event}`, payload ?? {});
  }
}
