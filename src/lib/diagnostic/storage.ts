import type { DiagnosticAnswers } from "./types";

const KEY = "modus:diagnostic:v1";

export type SavedState = {
  step: number;
  answers: DiagnosticAnswers;
};

export function saveDiagnosticState(state: SavedState) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — diagnostic still works, just won't resume
  }
}

export function loadDiagnosticState(): SavedState | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedState;
  } catch {
    return null;
  }
}

export function clearDiagnosticState() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
