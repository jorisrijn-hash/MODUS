"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { HoldToConfirm } from "@/components/ui/HoldToConfirm";
import type { DiagnosticAnswers } from "@/lib/diagnostic/types";
import { useDict, useLocale } from "@/lib/i18n/context";
import { pick } from "@/lib/diagnostic/questions";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}${"•".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

export function ReviewScreen({
  answers,
  onEdit,
  onSubmit,
}: {
  answers: DiagnosticAnswers;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}) {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.diagnosticReview;
  const [consent, setConsent] = useState(true);

  const groups = [
    {
      title: t.groupBusiness,
      step: 0,
      lines: [
        answers.companyName,
        answers.industry === pick("industries", "Other", locale) ? answers.industryOther : answers.industry,
        answers.employees && `${answers.employees} ${t.employeesSuffix}`,
        answers.locations && `${answers.locations} ${t.locationsSuffix}`,
      ].filter(Boolean) as string[],
    },
    {
      title: t.groupSystems,
      step: 2,
      lines: answers.systems.length ? answers.systems : [t.noSystemsSelected],
    },
    {
      title: t.groupFriction,
      step: 3,
      lines: [answers.primaryPain || answers.friction[0] || t.notSpecified],
    },
    {
      title: t.groupGoal,
      step: 4,
      lines: answers.priorities.length ? answers.priorities : [t.notSpecified],
    },
    {
      title: t.groupContact,
      step: 5,
      lines: [
        `${answers.firstName} ${answers.lastName}`.trim(),
        maskEmail(answers.email),
      ].filter(Boolean) as string[],
    },
  ];

  return (
    <div>
      <Reveal>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          {t.label}
        </p>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-3 text-2xl font-semibold text-ink">{t.title}</h2>
      </Reveal>

      <div className="mt-8 divide-y divide-line border-t border-line">
        {groups.map((group, i) => (
          <Reveal key={group.title} delay={0.05 + i * 0.05}>
            <div className="flex items-start justify-between gap-6 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                  {group.title}
                </p>
                <p className="mt-1.5 text-[14px] text-graphite">{group.lines.join(" · ")}</p>
              </div>
              <button
                type="button"
                onClick={() => onEdit(group.step)}
                className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-modus hover:text-modus-light"
              >
                {t.edit}
              </button>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.35}>
        <label className="mt-8 flex items-start gap-3 text-[13px] text-graphite">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-modus"
          />
          <span>{t.consentText}</span>
        </label>
      </Reveal>

      <Reveal delay={0.42} className="mt-6">
        <HoldToConfirm
          idleLabel={t.holdIdle}
          holdingLabel={t.holdHolding}
          completeLabel={t.holdComplete}
          onConfirm={() => consent && onSubmit()}
        />
      </Reveal>
    </div>
  );
}
