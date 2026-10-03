"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Gauge,
  Radar,
  Kanban,
  ArrowRight,
  RotateCcw,
  Check,
} from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { useLocale } from "@/lib/i18n/context";
import "@/components/admin/workspace.css";

type DemoStage = "new" | "review" | "contacted";

/** A deliberately local demonstration: no auth, writes, email or fake AI calls. */
export function PlatformMockup() {
  const { locale } = useLocale();
  const nl = locale === "nl";
  const [tab, setTab] = useState<"overview" | "signals" | "workflow">(
    "overview",
  );
  const [stage, setStage] = useState<DemoStage>("new");
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const stages: { id: DemoStage; label: string }[] = [
    { id: "new", label: nl ? "Nieuw" : "New" },
    { id: "review", label: nl ? "In review" : "In review" },
    { id: "contacted", label: nl ? "Contact gelegd" : "Contacted" },
  ];
  const nav = [
    {
      id: "overview" as const,
      label: nl ? "Overzicht" : "Overview",
      icon: Gauge,
    },
    { id: "signals" as const, label: nl ? "Signalen" : "Signals", icon: Radar },
    { id: "workflow" as const, label: "Workflow", icon: Kanban },
  ];
  function reset() {
    setTab("overview");
    setStage("new");
    setExpanded(false);
    setNote("");
    setSavedNote("");
  }

  return (
    <section
      aria-label={
        nl ? "Interactieve MODUS OS demo" : "Interactive MODUS OS demo"
      }
      data-testid="platform-demo"
      className="modus-workspace overflow-hidden rounded-2xl border border-line shadow-[0_24px_80px_-40px_rgba(0,0,0,.6)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <LogoMark className="h-5 w-5 text-modus" />
          <span className="text-xs font-medium tracking-[.12em]">MODUS OS</span>
          <span className="rounded border border-line px-2 py-1 text-[9px] uppercase tracking-widest text-muted">
            {nl ? "Testdemo" : "Test demo"}
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="flex min-h-9 items-center gap-2 text-xs text-muted hover:text-ink"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
      <div className="grid md:grid-cols-[164px_minmax(0,1fr)]">
        <nav
          aria-label="Demo navigation"
          className="flex gap-1 overflow-x-auto border-b border-line bg-mineral p-3 md:flex-col md:border-b-0 md:border-r"
        >
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-xs ${tab === id ? "bg-surface-elevated text-ink" : "text-muted hover:bg-surface"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 p-5 sm:p-7">
          <p className="workspace-eyebrow">
            {nl
              ? "Voorbeeldbedrijf / Northline Studio"
              : "Sample business / Northline Studio"}
          </p>
          {tab === "overview" && (
            <div>
              <h3 className="mt-3 text-2xl font-medium tracking-tight">
                {nl
                  ? "Minder zoeken. Meer vooruitgang."
                  : "Less searching. More progress."}
              </h3>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted">
                {nl
                  ? "Volg één voorbeeld van signaal naar een concrete volgende stap."
                  : "Follow one example from a signal to a concrete next step."}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: nl ? "Signalen" : "Signals", value: 1 },
                  {
                    label: nl ? "In review" : "In review",
                    value: stage === "review" ? 1 : 0,
                  },
                  {
                    label: nl ? "Contact gelegd" : "Contacted",
                    value: stage === "contacted" ? 1 : 0,
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-line bg-surface p-3 sm:p-4"
                  >
                    <p className="text-[10px] text-muted">{metric.label}</p>
                    <p className="mt-3 text-2xl">{metric.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-line bg-surface p-5">
                <p className="workspace-eyebrow">
                  {nl ? "Mogelijke verbetering" : "Opportunity to investigate"}
                </p>
                <h4 className="mt-2 text-sm font-medium">
                  {nl
                    ? "Aanvragen komen binnen. Opvolging is verspreid."
                    : "Enquiries arrive. Follow-up is scattered."}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-graphite">
                  {nl
                    ? "Drie kanalen en een gedeelde spreadsheet. Begin met de vraag wie elke aanvraag opvolgt."
                    : "Three intake channels and a shared spreadsheet. Start by asking who owns each enquiry."}
                </p>
                <button
                  type="button"
                  onClick={() => setTab("signals")}
                  className="workspace-primary mt-5 inline-flex min-h-10 items-center gap-3 rounded-lg px-4 text-xs font-medium"
                >
                  {nl ? "Onderzoek het signaal" : "Inspect the signal"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
          {tab === "signals" && (
            <div>
              <h3 className="mt-3 text-2xl font-medium tracking-tight">
                {nl ? "Begrijp eerst de oorzaak." : "Understand before acting."}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {nl
                  ? "Een signaal is een vraag om te onderzoeken, geen diagnose."
                  : "A signal is a prompt to investigate, not a diagnosis."}
              </p>
              <div className="mt-5 rounded-xl border border-line bg-surface p-5">
                <p className="workspace-eyebrow">
                  {nl
                    ? "Voorlopig / vereist review"
                    : "Preliminary / requires review"}
                </p>
                <h4 className="mt-2 text-sm font-medium">
                  {nl
                    ? "Een gedeeld overzicht ontbreekt mogelijk."
                    : "A shared intake view may be missing."}
                </h4>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls="demo-evidence"
                  onClick={() => setExpanded(!expanded)}
                  className="mt-4 min-h-10 text-xs text-modus underline underline-offset-4"
                >
                  {expanded
                    ? nl
                      ? "Verberg de onderbouwing"
                      : "Hide the evidence"
                    : nl
                      ? "Waarom verschijnt dit?"
                      : "Why is this showing?"}
                </button>
                {expanded && (
                  <div
                    id="demo-evidence"
                    className="mt-3 space-y-3 border-t border-line pt-4 text-xs leading-relaxed text-graphite"
                  >
                    <p>
                      <strong className="text-ink">
                        {nl ? "Antwoorden: " : "Reported answers: "}
                      </strong>
                      {nl
                        ? "Aanvragen via e-mail, telefoon en website; handmatige registratie in een spreadsheet."
                        : "Enquiries via email, phone and website; manually recorded in a spreadsheet."}
                    </p>
                    <p>
                      <strong className="text-ink">
                        {nl ? "Te controleren: " : "Validate: "}
                      </strong>
                      {nl
                        ? "Wie is eigenaar? Hoe vaak raakt een aanvraag zoek? Hoe lang duurt opvolging?"
                        : "Who owns follow-up? How often is an enquiry missed? How long does a response take?"}
                    </p>
                    <p>
                      <strong className="text-ink">
                        {nl ? "Mogelijke stap: " : "Possible next step: "}
                      </strong>
                      {nl
                        ? "Eén intake-overzicht met een verantwoordelijke per aanvraag."
                        : "One intake view with a named owner for each enquiry."}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setStage("review");
                    setTab("workflow");
                  }}
                  className="workspace-primary mt-4 flex min-h-10 items-center gap-3 rounded-lg px-4 text-xs font-medium"
                >
                  {nl ? "Start de voorbeeldreview" : "Start sample review"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
          {tab === "workflow" && (
            <div>
              <h3 className="mt-3 text-2xl font-medium tracking-tight">
                {nl
                  ? "Maak de volgende stap zichtbaar."
                  : "Make the next step visible."}
              </h3>
              <p className="mt-2 text-xs text-muted">
                {nl
                  ? "Verplaats de kaart. Niets wordt verzonden of opgeslagen buiten deze demo."
                  : "Move the card. Nothing is sent or saved outside this demo."}
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {stages.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-line bg-surface p-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      {item.label}
                    </p>
                    {stage === item.id ? (
                      <div className="mt-3 rounded-lg border border-line bg-paper p-3">
                        <p className="text-xs font-medium">Northline Studio</p>
                        <p className="mt-2 text-[11px] text-muted">
                          {nl ? "Verspreide opvolging" : "Scattered follow-up"}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-4 text-[11px] text-muted">—</p>
                    )}
                  </div>
                ))}
              </div>
              <label className="mt-5 block text-xs text-graphite">
                {nl ? "Fase van de voorbeeldkaart" : "Sample card stage"}
                <select
                  aria-label="Sample card stage"
                  value={stage}
                  onChange={(event) =>
                    setStage(event.target.value as DemoStage)
                  }
                  className="ml-3 min-h-10 max-w-full rounded-lg border border-line bg-surface px-3"
                >
                  {stages.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <form
                className="mt-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSavedNote(note.trim());
                }}
              >
                <label
                  className="block text-xs text-graphite"
                  htmlFor="demo-note"
                >
                  {nl
                    ? "Wat zou je eerst controleren?"
                    : "What would you validate first?"}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    id="demo-note"
                    value={note}
                    maxLength={250}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={
                      nl
                        ? "Bijv. wie is verantwoordelijk voor opvolging?"
                        : "e.g. Who owns follow-up?"
                    }
                    className="min-h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-xs"
                  />
                  <button
                    type="submit"
                    className="workspace-primary min-h-10 rounded-lg px-4 text-xs"
                  >
                    {nl ? "Bewaar in demo" : "Save in demo"}
                  </button>
                </div>
              </form>
              {savedNote && (
                <p
                  role="status"
                  className="mt-3 flex items-start gap-2 text-xs text-modus"
                >
                  <Check className="h-4 w-4 shrink-0" />
                  {savedNote}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {/*
        * A note strip, not a page footer. It was a <footer> element,
        * which put a second one on the homepage alongside the site
        * footer — the existing smoke test then matched two and failed.
        * This content is a caption for the demo, so a div is both
        * correct and unambiguous.
        */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
        <p className="max-w-xl text-[10px] leading-relaxed text-muted">
          {nl
            ? "Voorbeeldgegevens · lokale demo · geen live integraties of AI. Beschikbare functies worden bepaald door de afgesproken scope."
            : "Sample data · local demo · no live integrations or AI. Available features depend on the agreed scope."}
        </p>
        <Link
          href="/diagnostic"
          className="flex min-h-9 items-center gap-2 text-xs text-modus"
        >
          {nl ? "Begin met jouw bedrijf" : "Start with your business"}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}
