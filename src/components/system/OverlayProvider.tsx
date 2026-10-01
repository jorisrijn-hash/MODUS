"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { listenChatbotState } from "@/lib/chatbot";

export type OverlayKind = "consent" | "consentPreferences" | "diagnosticRecovery" | "languagePrompt";

const PRIORITY: OverlayKind[] = ["consent", "consentPreferences", "diagnosticRecovery", "languagePrompt"];

type OverlayContextValue = {
  active: OverlayKind | null;
  request: (kind: OverlayKind) => void;
  release: (kind: OverlayKind) => void;
  isActive: (kind: OverlayKind) => boolean;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

/**
 * Central priority gate for MODUS system overlays. Each subsystem announces
 * "I would like to show" via request()/release() rather than rendering
 * itself unconditionally, so only one unsolicited system surface competes
 * for attention at a time. Order in PRIORITY mirrors the brief: legally
 * required consent first, an explicitly opened dialog next, diagnostic
 * recovery, then the passive language suggestion last. The chatbot is
 * intentionally outside this queue (it is user-toggled persistent UI, not
 * a one-shot prompt) but its open state still suppresses the language
 * prompt, per the brief.
 */
export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [wants, setWants] = useState<Set<OverlayKind>>(new Set());
  const [chatbotOpen, setChatbotOpen] = useState(false);

  useEffect(() => listenChatbotState(setChatbotOpen), []);

  const request = useCallback((kind: OverlayKind) => {
    setWants((prev) => (prev.has(kind) ? prev : new Set(prev).add(kind)));
  }, []);

  const release = useCallback((kind: OverlayKind) => {
    setWants((prev) => {
      if (!prev.has(kind)) return prev;
      const next = new Set(prev);
      next.delete(kind);
      return next;
    });
  }, []);

  const active = useMemo<OverlayKind | null>(() => {
    for (const kind of PRIORITY) {
      if (!wants.has(kind)) continue;
      if (kind === "languagePrompt" && chatbotOpen) continue;
      return kind;
    }
    return null;
  }, [wants, chatbotOpen]);

  const isActive = useCallback((kind: OverlayKind) => active === kind, [active]);

  const value = useMemo<OverlayContextValue>(
    () => ({ active, request, release, isActive }),
    [active, request, release, isActive]
  );

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlay must be used within OverlayProvider");
  return ctx;
}

/**
 * Convenience hook: request a slot on mount, release on unmount, and get
 * back whether this consumer currently holds the active slot.
 */
export function useOverlaySlot(kind: OverlayKind, wantsToShow: boolean) {
  const { request, release, isActive } = useOverlay();

  useEffect(() => {
    if (!wantsToShow) return;
    request(kind);
    return () => release(kind);
  }, [kind, wantsToShow, request, release]);

  return wantsToShow && isActive(kind);
}
