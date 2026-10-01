"use client";

import dynamic from "next/dynamic";

const DiagnosticShell = dynamic(
  () => import("@/components/diagnostic/DiagnosticShell").then((m) => m.DiagnosticShell),
  { ssr: false }
);

export function DiagnosticClientEntry() {
  return <DiagnosticShell />;
}
