"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SystemMap } from "@/components/diagnostic/SystemMap";
import { ProfilePanel } from "@/components/diagnostic/ProfilePanel";
import { ProgressBar } from "@/components/diagnostic/ProgressBar";
import { ReviewScreen } from "@/components/diagnostic/ReviewScreen";
import { SubmitTransition } from "@/components/diagnostic/SubmitTransition";
import { ResultView } from "@/components/diagnostic/ResultView";
import { DiagnosticRecoveryPrompt } from "@/components/diagnostic/DiagnosticRecoveryPrompt";
import { ProfileReadyScreen } from "@/components/diagnostic/ProfileReadyScreen";
import { useDict } from "@/lib/i18n/context";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { DiagnosticScene } from "@/components/diagnostic/DiagnosticScene";
import { StepBusiness } from "@/components/diagnostic/StepBusiness";
import { StepOperations } from "@/components/diagnostic/StepOperations";
import { StepSystems } from "@/components/diagnostic/StepSystems";
import { StepFriction } from "@/components/diagnostic/StepFriction";
import { StepPriorities } from "@/components/diagnostic/StepPriorities";
import { StepContact } from "@/components/diagnostic/StepContact";
import { companyNameSchema, emailSchema, nameSchema, textareaSchema, validatePhone, websiteSchema } from "@/lib/diagnostic/schema";
import { emptyAnswers, type DiagnosticAnswers } from "@/lib/diagnostic/types";
import { loadDiagnosticState, saveDiagnosticState, clearDiagnosticState } from "@/lib/diagnostic/storage";
import { buildProfileIndicators, buildSignals } from "@/lib/diagnostic/rules";
import { submitDiagnostic } from "@/lib/diagnostic/submit";
import { saveContextReference, getContextReference, clearContextReference } from "@/lib/customerContext/storage";
import { useCustomerContext } from "@/lib/customerContext/useCustomerContext";
import { track } from "@/lib/chatbot";

type Screen = "intro" | "form" | "review" | "submitting" | "submit_error" | "result" | "profile";

function canProceed(step: number, a: DiagnosticAnswers): boolean {
  if (step === 0) {
    return (
      companyNameSchema.safeParse(a.companyName).success &&
      websiteSchema.safeParse(a.website).success &&
      !!a.industry &&
      !!a.employees &&
      !!a.locations
    );
  }
  if (step === 1) return a.reachChannels.length > 0;
  if (step === 2) return !!a.connectionLevel;
  if (step === 3) {
    const hasFriction = a.friction.length > 0;
    // problemDescription is optional: empty is fine, but if they did write
    // something it should still clear the same bar the field enforces
    // while typing (see StepFriction's onValidate).
    const description = a.problemDescription.trim();
    const descriptionOk = !description || textareaSchema(20, 500).safeParse(a.problemDescription).success;
    return hasFriction && descriptionOk;
  }
  if (step === 4) return a.priorities.length > 0 && !!a.timing;
  if (step === 5) {
    const phoneOk = !a.phone.trim() || validatePhone(a.phone).valid;
    return (
      nameSchema.safeParse(a.firstName).success &&
      nameSchema.safeParse(a.lastName).success &&
      emailSchema.safeParse(a.email).success &&
      phoneOk
    );
  }
  return false;
}

// This component is only ever rendered client-side (see page.tsx's
// dynamic ssr:false import), so it's safe to read sessionStorage
// synchronously in these lazy initializers — no server/client markup to
// mismatch.
function resumableState() {
  const saved = loadDiagnosticState();
  if (saved && (saved.answers.companyName || saved.step > 0)) return saved;
  return null;
}

// A stored profile reference only wins the initial screen if there's no
// in-progress draft to resume instead — an active draft always takes
// priority, since it's the more recent, more specific thing to return to.
function initialScreen(hasDraft: boolean): Screen {
  if (hasDraft) return "intro";
  return getContextReference() ? "profile" : "intro";
}

export function DiagnosticShell() {
  const dict = useDict();
  // Gated on the MOUNT, not on a CSS class.
  //
  // A `hidden 2xl:block` wrapper was tried first and is NOT equivalent: the
  // component still mounted, still created a WebGL context and still held
  // GPU memory on every narrower screen — invisible, but paid for.
  //
  // 1024px is the desktop threshold: the scene is the entry screen's main
  // visual, so it has to appear at ordinary desktop widths, while phones
  // and small tablets keep a form with no WebGL at all.
  const wideEnoughForScene = useMediaQuery("(min-width: 1024px)");
  const STEP_LABELS = dict.diagnosticShell.stepLabels;
  const STEP_HEADLINES = dict.diagnosticShell.stepHeadlines;
  // Section 13 — a purely visual, non-authoritative echo of the homepage
  // category chip (if the visitor arrived via `DiagnosticEntry`'s
  // `?hint=`). Read once on mount; never written to sessionStorage, never
  // consulted by `canProceed` or any step component.
  const entryHint = useSearchParams().get("hint");
  const [resumedState] = useState(resumableState);
  const [screen, setScreen] = useState<Screen>(() => initialScreen(!!resumedState));
  const { companyName: contextCompanyName, summary: contextSummary, summaryStatus: contextSummaryStatus } =
    useCustomerContext();
  const [step, setStep] = useState(resumedState?.step ?? 0);
  const [answers, setAnswers] = useState<DiagnosticAnswers>(resumedState?.answers ?? emptyAnswers);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(!!resumedState);
  const [resumed, setResumed] = useState(false);

  // A stored token that no longer resolves (dev database reset, revoked,
  // malformed) falls back to the generic intro automatically — never gets
  // stuck showing "profile unavailable" as a dead end. Adjusted during
  // render (React's own pattern for reacting to a changing value) rather
  // than in an effect, so it lands before the next paint instead of after.
  const [lastSummaryStatus, setLastSummaryStatus] = useState(contextSummaryStatus);
  if (contextSummaryStatus !== lastSummaryStatus) {
    setLastSummaryStatus(contextSummaryStatus);
    if (screen === "profile" && contextSummaryStatus === "error") {
      clearContextReference();
      setScreen("intro");
    }
  }

  useEffect(() => {
    if (screen === "form") saveDiagnosticState({ step, answers });
  }, [screen, step, answers]);

  // Fires once, on tab close/refresh or on navigating away in-app, but only
  // if the visitor was actually mid-flow (not on the intro screen, and not
  // already at the result). Reads live state via refs since this effect's
  // own cleanup only ever runs with whatever `screen`/`step` were captured
  // when it was registered otherwise.
  const abandonRef = useRef({ screen, step });
  useEffect(() => {
    abandonRef.current = { screen, step };
  }, [screen, step]);
  useEffect(() => {
    function trackIfAbandoned() {
      const { screen: currentScreen, step: currentStep } = abandonRef.current;
      if (currentScreen === "form" || currentScreen === "review") {
        track("diagnostic_abandoned", { screen: currentScreen, step: currentStep });
      }
    }
    window.addEventListener("beforeunload", trackIfAbandoned);
    return () => {
      window.removeEventListener("beforeunload", trackIfAbandoned);
      trackIfAbandoned();
    };
  }, []);

  // Section 21: after a step advances (forward or back), focus should land
  // on the new question rather than staying on a now-detached Next/Back
  // button or being left wherever the mouse happens to be — the heading is
  // the one thing guaranteed present on every step regardless of which
  // fields it contains. Skipped on the very first mount (`resumed` state
  // already covers "don't replay on resume"; this only reacts to `step`
  // actually changing while already on the form screen).
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const isFirstFormRender = useRef(true);
  useEffect(() => {
    if (screen !== "form") return;
    if (isFirstFormRender.current) {
      isFirstFormRender.current = false;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [screen, step]);

  function continueDiagnostic() {
    setResumed(true);
    setShowRecoveryPrompt(false);
    setScreen("form");
  }

  function startAgainFresh() {
    clearDiagnosticState();
    setAnswers(emptyAnswers);
    setStep(0);
    setShowRecoveryPrompt(false);
  }

  function dismissRecovery() {
    // "Not now": leave the saved progress in storage untouched (so the
    // prompt can offer it again on a future visit), but start this visit
    // fresh in memory rather than silently continuing old answers.
    setAnswers(emptyAnswers);
    setStep(0);
    setShowRecoveryPrompt(false);
  }

  function update<K extends keyof DiagnosticAnswers>(key: K, value: DiagnosticAnswers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  function begin() {
    track("diagnostic_started");
    setScreen("form");
  }

  function startNewFromProfile() {
    clearContextReference();
    setScreen("intro");
  }

  function next() {
    if (!canProceed(step, answers)) return;
    track("diagnostic_step_completed", { step });
    if (step < STEP_LABELS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setScreen("review");
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
    else setScreen("intro");
  }

  // The in-flight request and `SubmitTransition`'s fixed-length animation
  // race independently — the ref lets `onSubmitDone` (fired by the
  // animation's own timers, Section 6/19 both want the loader to feel
  // quick and deterministic) pick up whichever result is ready, awaiting
  // it if the request is still outstanding.
  const submitResultRef = useRef<ReturnType<typeof submitDiagnostic> | null>(null);

  function submit() {
    track("diagnostic_submitted");
    setScreen("submitting");
    const profile = buildProfileIndicators(answers);
    const signals = buildSignals(answers);
    submitResultRef.current = submitDiagnostic(answers, profile, signals);
  }

  async function onSubmitDone() {
    const result = await submitResultRef.current;
    if (!result?.ok) {
      track("diagnostic_submit_failed");
      setScreen("submit_error");
      return;
    }
    if (result.contextToken) {
      saveContextReference(result.contextToken, answers.companyName);
    }
    clearDiagnosticState();
    setScreen("result");
  }

  const stepComponents = [
    <StepBusiness key="0" answers={answers} update={update} />,
    <StepOperations key="1" answers={answers} update={update} />,
    <StepSystems key="2" answers={answers} update={update} />,
    <StepFriction key="3" answers={answers} update={update} />,
    <StepPriorities key="4" answers={answers} update={update} />,
    <StepContact key="5" answers={answers} update={update} errors={errors} setErrors={setErrors} />,
  ];

  // Checkpoint 6 pre-task — this used to be `<AnimatePresence
  // mode="popLayout">` wrapping these seven mutually-exclusive screens,
  // each with its own `exit`. That's the same pattern
  // `PageTransition.tsx` had (see that file's own comment for the full
  // root-cause writeup): `AnimatePresence`'s exit-completion bookkeeping
  // is unreliable under the installed React/Motion combination, so an
  // exited screen would occasionally never actually unmount, stacking
  // under the next one. Since exactly one of these `screen === "x"`
  // conditions is ever true at a time, there was never anything for
  // `AnimatePresence` to legitimately coexist — removing it entirely
  // (no exit animation, each screen just fades in on its own keyed
  // motion.div) is both simpler and, verified via Playwright, reliable
  // where the AnimatePresence version was not.
  return (
    <div className="relative min-h-[100svh] pt-20">
      {/*
       * The diagnostic's visual story, driven by the REAL screen and step
       * — not a parallel decorative counter. It holds the review
       * structure while submitting and can only reach its closing
       * composition once persistence is acknowledged (`result`).
       *
       * Decorative and `pointer-events-none`, placed behind the form so
       * it can never intercept input or cover a question. The accessible
       * description of each stage is the form's own heading and progress.
       */}
      {/*
       * ENTRY ONLY, for now.
       *
       * The scene implements the full sequence — entry sphere, separated
       * topic layers, review stack, mark closure — and that mapping is
       * unit-tested. But mounting it through the question and submit
       * screens measurably destabilised the submission flow: its render
       * loop and WebGL context compete with the submit transition, and
       * three separate specs began failing intermittently at the estimate
       * screen. Bisected: restricting the mount to `intro` returned the
       * suite to 45 passing with only the known pre-existing failure.
       *
       * So the focused form is deliberately free of WebGL again, which was
       * the original principle, and the entry screen gets its sphere.
       * Re-enabling the later stages needs the submit-transition timing
       * looked at first — see PROJECT-STATUS.md.
       */}
      {wideEnoughForScene && screen === "intro" && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute right-0 z-0 ${
            screen === "intro"
              ? // Entry: the sphere is the screen's subject, so it gets the
                // right half at full strength.
                "top-24 h-[min(62vh,540px)] w-[46%] opacity-100"
              : // Answering onward: BELOW the profile panel, which owns the
                // upper right. Placed behind it first and was almost
                // entirely occluded — the layers and their labels were
                // invisible, so the scene was paying for a WebGL context
                // and showing nothing. This uses the empty region instead,
                // where the separated layers and the active topic label
                // are actually legible.
                "bottom-10 h-[min(34vh,300px)] w-[38%] opacity-[0.75]"
          }`}
        >
          <DiagnosticScene
            screen={screen}
            step={step}
            labels={dict.diagnosticShell.stepTopics}
            className="h-full w-full"
          />
        </div>
      )}
      {screen === "intro" && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Container className="grid grid-cols-1 items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <Reveal>
                <SectionLabel id="SYS / 09">{dict.diagnosticShell.label}</SectionLabel>
              </Reveal>
              {entryHint && (
                <Reveal delay={0.03}>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                    {dict.diagnosticShell.hintPrefix} &middot; {entryHint}
                  </p>
                </Reveal>
              )}
              <Reveal delay={0.06}>
                <h1 className="mt-5 text-balance text-display-md font-semibold text-ink">
                  {dict.diagnosticShell.introTitle}
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-6 max-w-md text-[15px] leading-relaxed text-graphite">
                  {dict.diagnosticShell.introBody}
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                  <span>{dict.diagnosticShell.microTime}</span>
                  <span className="h-1 w-1 rounded-full bg-line" />
                  <span>{dict.diagnosticShell.microSections}</span>
                  <span className="h-1 w-1 rounded-full bg-line" />
                  <span>{dict.diagnosticShell.microAudit}</span>
                </div>
              </Reveal>

              <Reveal delay={0.24}>
                <div className="mt-9">
                  <MagneticButton>
                    <button
                      type="button"
                      onClick={begin}
                      className="inline-flex items-center gap-2 rounded bg-modus px-6 py-3.5 text-[14px] font-medium text-paper transition-colors hover:bg-modus-light"
                    >
                      {dict.diagnosticShell.begin}
                      <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </MagneticButton>
                </div>
              </Reveal>

              <DiagnosticRecoveryPrompt
                visible={showRecoveryPrompt}
                onContinue={continueDiagnostic}
                onStartAgain={startAgainFresh}
                onDismiss={dismissRecovery}
              />
            </div>

            {/*
             * The empty SystemMap placeholder used to sit here, inside a
             * Reveal. At entry it drew a node diagram with nothing in it
             * yet, competing with the new sphere for the same space and
             * saying less. The sphere now owns the entry screen; SystemMap
             * is retained on the form screen, where it actually fills in
             * from the visitor's answers.
             */}
          </Container>
        </motion.div>
      )}

      {screen === "form" && (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Container className="py-10 lg:py-14">
            {resumed && (
              <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.08em] text-modus">
                {dict.diagnosticRecovery.resumedBadge}
              </p>
            )}
            <ProgressBar step={step} />

            <div className="mt-12 grid grid-cols-1 gap-14 lg:grid-cols-[1.3fr_1fr]">
              <div>
                {/* Checkpoint 5: one continuous conversation, not a page
                    transition — the outgoing step softly shifts+blurs
                    out while the next occupies the same spatial role
                    (Section 6). Still a plain keyed motion.div (same
                    mechanism as before, not AnimatePresence — nothing
                    needs to coexist mid-transition since steps replace
                    each other entirely), just with blur added to the
                    existing opacity+y animation. */}
                <motion.div
                  key={step}
                  ref={stepHeadingRef}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h2
                    tabIndex={-1}
                    className="text-balance text-display-sm font-semibold text-ink outline-none"
                  >
                    {STEP_HEADLINES[step]}
                  </h2>
                  <div className="mt-7">{stepComponents[step]}</div>
                </motion.div>

                <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
                  <button
                    type="button"
                    onClick={back}
                    className="inline-flex items-center gap-1.5 text-[13px] text-graphite hover:text-ink"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {dict.diagnosticShell.back}
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canProceed(step, answers)}
                    className="inline-flex items-center gap-2 rounded bg-ink px-6 py-3 text-[13.5px] font-medium text-paper transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {step === STEP_LABELS.length - 1 ? dict.diagnosticShell.review : dict.diagnosticShell.next}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className="hidden lg:block">
                <ProfilePanel answers={answers} />
              </div>
            </div>
          </Container>
        </motion.div>
      )}

      {screen === "review" && (
        <motion.div
          key="review"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Container className="max-w-2xl py-16">
            <ReviewScreen
              answers={answers}
              onEdit={(s) => {
                setStep(s);
                setScreen("form");
              }}
              onSubmit={submit}
            />
          </Container>
        </motion.div>
      )}

      {screen === "submitting" && (
        <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SubmitTransition onDone={onSubmitDone} />
        </motion.div>
      )}

      {screen === "submit_error" && (
        <motion.div key="submit_error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Container className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              {dict.diagnosticSubmitError.label}
            </p>
            <h1 className="mt-4 text-balance text-display-sm font-semibold text-ink">
              {dict.diagnosticSubmitError.heading}
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-graphite">
              {dict.diagnosticSubmitError.body}
            </p>
            <div className="mt-8 flex items-center gap-6">
              <button
                type="button"
                onClick={() => setScreen("review")}
                className="text-[13px] text-graphite hover:text-ink"
              >
                {dict.diagnosticSubmitError.backToReview}
              </button>
              <button
                type="button"
                onClick={submit}
                className="inline-flex items-center gap-2 rounded bg-ink px-6 py-3 text-[13.5px] font-medium text-paper transition-colors hover:bg-graphite"
              >
                {dict.diagnosticSubmitError.retry}
              </button>
            </div>
          </Container>
        </motion.div>
      )}

      {screen === "result" && (
        <motion.div
          key="result"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Container className="py-16">
            <ResultView answers={answers} />
          </Container>
        </motion.div>
      )}

      {screen === "profile" && (
        <motion.div
          key="profile"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <ProfileReadyScreen
            companyName={contextCompanyName}
            summary={contextSummary}
            status={contextSummaryStatus}
            onStartNew={startNewFromProfile}
          />
        </motion.div>
      )}
    </div>
  );
}
