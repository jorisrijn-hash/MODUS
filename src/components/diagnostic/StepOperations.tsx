"use client";

import { motion } from "motion/react";
import { OptionGrid } from "@/components/diagnostic/OptionGrid";
import { toggleInArray } from "@/lib/diagnostic/utils";
import { getReachChannels, getEnquiryHandling, getAdminHoursOptions, getDependencyLevels } from "@/lib/diagnostic/questions";
import type { DiagnosticAnswers } from "@/lib/diagnostic/types";
import { useDict, useLocale } from "@/lib/i18n/context";

export function StepOperations({
  answers,
  update,
}: {
  answers: DiagnosticAnswers;
  update: <K extends keyof DiagnosticAnswers>(key: K, value: DiagnosticAnswers[K]) => void;
}) {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.diagnosticSteps.operations;
  const reachChannels = getReachChannels(locale);
  const enquiryHandling = getEnquiryHandling(locale);
  const adminHoursOptions = getAdminHoursOptions(locale);
  const dependencyLevels = getDependencyLevels(locale);
  const MATURITY_LABELS = t.maturityLabels;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[14px] font-medium text-ink">{t.reachTitle}</p>
        <p className="mt-1 text-[12.5px] text-muted">{t.selectAll}</p>
        <div className="mt-3">
          <OptionGrid
            options={reachChannels}
            selected={answers.reachChannels}
            onToggle={(v) => update("reachChannels", toggleInArray(answers.reachChannels, v))}
            columns={3}
          />
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.enquiryTitle}</p>
        <div className="mt-3">
          <OptionGrid
            options={enquiryHandling}
            selected={answers.enquiryHandling}
            onToggle={(v) => update("enquiryHandling", toggleInArray(answers.enquiryHandling, v))}
            columns={3}
          />
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.adminTitle}</p>
        <div className="mt-3">
          <OptionGrid
            options={adminHoursOptions}
            selected={answers.adminHours ? [answers.adminHours] : []}
            onToggle={(v) => update("adminHours", v)}
            columns={3}
          />
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.standardizationTitle}</p>
        <div className="mt-4 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update("processStandardization", n)}
              className="relative flex h-9 flex-1 items-center justify-center rounded-sm border border-line"
            >
              {answers.processStandardization === n && (
                <motion.span
                  layoutId="maturity-fill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-sm bg-modus"
                />
              )}
              <span
                className={`relative z-10 font-mono text-[12px] ${
                  answers.processStandardization === n ? "text-paper" : "text-muted"
                }`}
              >
                {n}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
          <span>{t.maturityLow}</span>
          <span>{t.maturityHigh}</span>
        </div>
        {MATURITY_LABELS[answers.processStandardization - 1] && (
          <p className="mt-2 text-[12.5px] text-graphite">
            {MATURITY_LABELS[answers.processStandardization - 1]}
          </p>
        )}
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.dependencyTitle}</p>
        <div className="mt-3">
          <OptionGrid
            options={[...dependencyLevels]}
            selected={answers.dependency ? [answers.dependency] : []}
            onToggle={(v) => update("dependency", v as DiagnosticAnswers["dependency"])}
            columns={3}
          />
        </div>
      </div>
    </div>
  );
}
