"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Overview customization — presentation-only, persisted to localStorage so
 * it survives a reload within the demo session. Four top-level widgets
 * (not one-per-card) so drag-reordering stays a simple, robust vertical
 * list (Motion's `Reorder.Group`) rather than a full multi-column grid
 * engine — a real, working feature scoped to what a showcase needs rather
 * than a from-scratch layout library.
 */
export type WidgetId = "briefing" | "kpis" | "insights" | "activity";

export const WIDGET_LABELS: Record<WidgetId, string> = {
  briefing: "MODUS Briefing",
  kpis: "Key Metrics",
  insights: "Performance & MODUS Score",
  activity: "Signals & Activity",
};

export const ALL_WIDGETS: WidgetId[] = ["briefing", "kpis", "insights", "activity"];

export type PresetId = "executive" | "performance" | "growth" | "operations" | "custom";

export const PRESETS: Record<Exclude<PresetId, "custom">, WidgetId[]> = {
  executive: ["briefing", "kpis", "insights"],
  performance: ["kpis", "insights"],
  growth: ["kpis", "insights", "activity"],
  operations: ["briefing", "activity"],
};

export const PRESET_LABELS: Record<PresetId, string> = {
  executive: "Executive",
  performance: "Performance",
  growth: "Growth",
  operations: "Operations",
  custom: "Custom",
};

type LayoutState = { order: WidgetId[]; preset: PresetId };

const DEFAULT_STATE: LayoutState = { order: ALL_WIDGETS, preset: "custom" };
const STORAGE_KEY = "modus:app-overview-layout:v1";
const CHANGE_EVENT = "modus:app-overview-layout:change";

function readState(): LayoutState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as LayoutState;
    const validOrder = parsed.order.filter((w): w is WidgetId => ALL_WIDGETS.includes(w));
    return { order: validOrder.length ? validOrder : ALL_WIDGETS, preset: parsed.preset ?? "custom" };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: LayoutState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — current tab keeps working from in-memory state.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function getServerSnapshot(): LayoutState {
  return DEFAULT_STATE;
}

export function useOverviewLayout() {
  const state = useSyncExternalStore(subscribe, readState, getServerSnapshot);

  const setOrder = useCallback((order: WidgetId[]) => {
    writeState({ order, preset: "custom" });
  }, []);

  const toggleWidget = useCallback((id: WidgetId) => {
    const current = readState();
    const visible = current.order.includes(id);
    const order = visible ? current.order.filter((w) => w !== id) : [...current.order, id];
    writeState({ order, preset: "custom" });
  }, []);

  const applyPreset = useCallback((preset: PresetId) => {
    if (preset === "custom") return;
    writeState({ order: PRESETS[preset], preset });
  }, []);

  const reset = useCallback(() => {
    writeState(DEFAULT_STATE);
  }, []);

  return { order: state.order, preset: state.preset, setOrder, toggleWidget, applyPreset, reset };
}
