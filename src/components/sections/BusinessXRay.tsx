"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useDict } from "@/lib/i18n/context";
import { WarpField, useWarpField } from "@/components/ui/WarpField";

type Step = {
  id: string;
  label: string;
  whatHappens: string;
  why: string;
  detected?: string;
  intervention?: string;
  friction?: string;
  frictionLabel?: string;
};

type StepLabels = {
  whatHappensLabel: string;
  whatDetectedLabel: string;
  whyMattersLabel: string;
  interventionLabel: string;
};

const stepIds = ["customer", "website", "enquiry", "employee", "crm", "quote", "followup", "booking", "invoice"];

export function BusinessXRay() {
  const dict = useDict();
  const t = dict.home.businessXRay;
  const steps: Step[] = t.steps.map((s, i) => ({ id: stepIds[i], ...s }));
  const outcomes = t.outcomes;
  const [modusView, setModusView] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          {t.context}
        </p>
        <div className="inline-flex rounded-sm border border-line bg-white p-0.5">
          <button
            type="button"
            onClick={() => setModusView(false)}
            className={`rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-200 ${
              !modusView ? "bg-ink text-paper" : "text-muted hover:text-graphite"
            }`}
          >
            {t.normalView}
          </button>
          <button
            type="button"
            onClick={() => setModusView(true)}
            className={`rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-200 ${
              modusView ? "bg-modus text-paper" : "text-muted hover:text-graphite"
            }`}
          >
            {t.modusView}
          </button>
        </div>
      </div>

      <div className="relative mt-8">
        <div className="reg-mark -left-1 -top-1" />
        <div className="reg-mark -right-1 -top-1" />
        <div className="reg-mark -bottom-1 -left-1" />
        <div className="reg-mark -bottom-1 -right-1" />

        <WarpField className="rounded-md border border-line bg-white p-5 sm:p-7">
          <XRayFlow steps={steps} modusView={modusView} t={t} />

          <AnimatePresence>
            {modusView && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7 grid grid-cols-1 gap-6 rounded-sm border border-modus/30 bg-modus/5 p-5 sm:grid-cols-3"
              >
                {outcomes.map((o) => (
                  <div key={o.label}>
                    <p className="text-xl font-semibold tracking-tight text-modus">
                      {o.value}
                    </p>
                    <p className="mt-1 text-[12.5px] text-graphite">{o.label}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </WarpField>
      </div>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
        {modusView ? t.footerModus : t.footerNormal}
      </p>
    </div>
  );
}

function XRayFlow({ steps, modusView, t }: { steps: Step[]; modusView: boolean; t: StepLabels }) {
  const { open, close, activeId } = useWarpField();

  return (
    <div className="flex flex-col gap-0 lg:flex-row lg:flex-wrap lg:items-start lg:gap-y-6">
      {steps.map((step, i) => {
        const isFriction = modusView && Boolean(step.friction);
        const isLast = i === steps.length - 1;
        const isActive = activeId === step.id;
        return (
          <div key={step.id} className="flex flex-col lg:flex-row lg:items-start">
            <div className="flex flex-col items-start">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  if (isActive) {
                    close();
                    return;
                  }
                  open({
                    triggerEl: e.currentTarget,
                    id: step.id,
                    label: `SYS / ${step.label}`,
                    title: step.label,
                    content: (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Detail label={t.whatHappensLabel} text={step.whatHappens} />
                        {step.detected && (
                          <Detail label={t.whatDetectedLabel} text={step.detected} tone="signal" />
                        )}
                        <Detail label={t.whyMattersLabel} text={step.why} />
                        {step.intervention && (
                          <Detail label={t.interventionLabel} text={step.intervention} tone="modus" />
                        )}
                      </div>
                    ),
                  });
                }}
                className={`rounded-sm border px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.06em] transition-colors duration-200 ${
                  isActive
                    ? "border-modus bg-modus/5 text-modus"
                    : isFriction
                      ? "border-signal/50 text-graphite hover:border-signal"
                      : "border-line text-graphite hover:border-modus"
                }`}
              >
                {step.label}
              </motion.button>
              <AnimatePresence>
                {isFriction && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-1.5 max-w-[140px]"
                  >
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-signal">
                      {step.friction}
                    </p>
                    <p className="text-[11px] leading-snug text-muted">
                      {step.frictionLabel}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isLast && (
              <span className="flex shrink-0 items-center justify-center px-2 py-3 text-muted/50 lg:py-2.5">
                <ArrowDown className="h-3.5 w-3.5 lg:hidden" strokeWidth={1.5} />
                <ArrowRight className="hidden h-3.5 w-3.5 lg:block" strokeWidth={1.5} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Detail({
  label,
  text,
  tone = "default",
}: {
  label: string;
  text: string;
  tone?: "default" | "signal" | "modus";
}) {
  return (
    <div>
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.08em] ${
          tone === "signal" ? "text-signal" : tone === "modus" ? "text-modus" : "text-muted"
        }`}
      >
        {label}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-graphite">{text}</p>
    </div>
  );
}
