"use client";

import { OptionGrid } from "@/components/diagnostic/OptionGrid";
import { ValidatedTextarea } from "@/components/diagnostic/ValidatedTextarea";
import { toggleInArray } from "@/lib/diagnostic/utils";
import { textareaSchema, translateValidationMessage } from "@/lib/diagnostic/schema";
import { getFrictionAreas, getFrequencyOptions, getImpactOptions } from "@/lib/diagnostic/questions";
import type { DiagnosticAnswers } from "@/lib/diagnostic/types";
import { useState } from "react";
import { useDict, useLocale } from "@/lib/i18n/context";

export function StepFriction({
  answers,
  update,
}: {
  answers: DiagnosticAnswers;
  update: <K extends keyof DiagnosticAnswers>(key: K, value: DiagnosticAnswers[K]) => void;
}) {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.diagnosticSteps.friction;
  const frictionAreas = getFrictionAreas(locale);
  const frequencyOptions = getFrequencyOptions(locale);
  const impactOptions = getImpactOptions(locale);
  const NOTHING_OBVIOUS = t.nothingObvious;
  const [descError, setDescError] = useState<string | null>(null);
  const realFriction = answers.friction.filter((f) => f !== NOTHING_OBVIOUS);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[15px] font-medium text-ink">{t.frictionTitle}</p>
        <div className="mt-3">
          <OptionGrid
            options={[...frictionAreas]}
            selected={answers.friction}
            onToggle={(v) => update("friction", toggleInArray(answers.friction, v))}
            columns={3}
          />
        </div>
        <button
          type="button"
          onClick={() => update("friction", answers.friction.includes(NOTHING_OBVIOUS) ? [] : [NOTHING_OBVIOUS])}
          className={`mt-3 w-full rounded border px-4 py-3 text-left text-[13.5px] transition-colors ${
            answers.friction.includes(NOTHING_OBVIOUS)
              ? "border-modus bg-modus/5 text-modus"
              : "border-line text-graphite hover:border-modus/50"
          }`}
        >
          {NOTHING_OBVIOUS}
        </button>
      </div>

      {realFriction.length > 0 && (
        <div>
          <p className="text-[14px] font-medium text-ink">{t.primaryPainTitle}</p>
          <div className="mt-3">
            <OptionGrid
              options={realFriction}
              selected={answers.primaryPain ? [answers.primaryPain] : []}
              onToggle={(v) => update("primaryPain", v)}
              columns={3}
            />
          </div>
        </div>
      )}

      <ValidatedTextarea
        label={t.descriptionLabel}
        placeholder={t.descriptionPlaceholder}
        value={answers.problemDescription}
        required={false}
        onChange={(v) => {
          update("problemDescription", v);
          if (descError) setDescError(null);
        }}
        min={20}
        max={500}
        error={descError}
        onValidate={() => {
          // Optional: an empty field is valid. Once they start typing,
          // still nudge for enough detail to be useful rather than a
          // one-word entry.
          if (!answers.problemDescription.trim()) {
            setDescError(null);
            return;
          }
          const r = textareaSchema(20, 500).safeParse(answers.problemDescription);
          setDescError(
            r.success
              ? null
              : translateValidationMessage(r.error.issues[0]?.message ?? t.descriptionFallbackError, locale, {
                  min: 20,
                  max: 500,
                })
          );
        }}
      />

      <div>
        <p className="text-[14px] font-medium text-ink">{t.frequencyTitle}</p>
        <div className="mt-3">
          <OptionGrid
            options={frequencyOptions}
            selected={answers.frequency ? [answers.frequency] : []}
            onToggle={(v) => update("frequency", v)}
            columns={3}
          />
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.impactTitle}</p>
        <div className="mt-3">
          <OptionGrid
            options={impactOptions}
            selected={answers.impact}
            onToggle={(v) => update("impact", toggleInArray(answers.impact, v))}
            columns={3}
          />
        </div>
      </div>
    </div>
  );
}
