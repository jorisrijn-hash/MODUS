import type { Metadata } from "next";
import { DiagnosticClientEntry } from "@/components/diagnostic/DiagnosticClientEntry";

export const metadata: Metadata = {
  title: "Business Diagnostic | MODUS",
  description:
    "Answer a few questions about your company, systems and current friction — MODUS builds an initial business profile and identifies where deeper analysis may be valuable.",
};

export default function DiagnosticPage() {
  return (
    <>
      <main>
        <DiagnosticClientEntry />
      </main>
    </>
  );
}
