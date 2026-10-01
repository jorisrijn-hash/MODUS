"use client";

import { useState } from "react";
import { ValidatedInput } from "@/components/diagnostic/ValidatedInput";
import { OptionGrid } from "@/components/diagnostic/OptionGrid";
import { companyNameSchema, translateValidationMessage, websiteSchema } from "@/lib/diagnostic/schema";
import { getIndustries, getEmployeeRanges, getLocationOptions, pick } from "@/lib/diagnostic/questions";
import type { DiagnosticAnswers } from "@/lib/diagnostic/types";
import { useDict, useLocale } from "@/lib/i18n/context";

export function StepBusiness({
  answers,
  update,
}: {
  answers: DiagnosticAnswers;
  update: <K extends keyof DiagnosticAnswers>(key: K, value: DiagnosticAnswers[K]) => void;
}) {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.diagnosticSteps.business;
  const industries = getIndustries(locale);
  const employeeRanges = getEmployeeRanges(locale);
  const locationOptions = getLocationOptions(locale);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [websiteError, setWebsiteError] = useState<string | null>(null);

  return (
    <div className="space-y-7">
      <ValidatedInput
        label={t.companyNameLabel}
        required
        value={answers.companyName}
        maxLength={80}
        onChange={(v) => {
          update("companyName", v);
          if (companyError) setCompanyError(null);
        }}
        onValidate={() => {
          const r = companyNameSchema.safeParse(answers.companyName);
          setCompanyError(
            r.success
              ? null
              : translateValidationMessage(r.error.issues[0]?.message ?? t.companyNameFallbackError, locale)
          );
        }}
        placeholder={t.companyNamePlaceholder}
      />

      <ValidatedInput
        label={t.websiteLabel}
        value={answers.website}
        onChange={(v) => {
          update("website", v);
          if (websiteError) setWebsiteError(null);
        }}
        onValidate={() => {
          const r = websiteSchema.safeParse(answers.website);
          setWebsiteError(r.success ? null : translateValidationMessage(t.websiteError, locale));
        }}
        error={websiteError}
        placeholder={t.websitePlaceholder}
      />

      <div>
        <p className="text-[14px] font-medium text-ink">{t.industryLabel}</p>
        <div className="mt-2.5">
          <select
            value={answers.industry}
            onChange={(e) => update("industry", e.target.value)}
            className="h-[54px] w-full rounded border border-line bg-paper px-4 text-[15px] text-ink outline-none focus:border-modus"
          >
            <option value="">{t.industryPlaceholder}</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
        {answers.industry === pick("industries", "Other", locale) && (
          <div className="mt-3">
            <ValidatedInput
              label={t.industryOtherLabel}
              value={answers.industryOther}
              maxLength={60}
              onChange={(v) => update("industryOther", v)}
              placeholder={t.industryOtherPlaceholder}
            />
          </div>
        )}
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.employeesLabel}</p>
        <div className="mt-2.5">
          <OptionGrid
            options={employeeRanges}
            selected={answers.employees ? [answers.employees] : []}
            onToggle={(v) => update("employees", v)}
            columns={3}
          />
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.locationsLabel}</p>
        <div className="mt-2.5">
          <OptionGrid
            options={locationOptions}
            selected={answers.locations ? [answers.locations] : []}
            onToggle={(v) => update("locations", v)}
            columns={3}
          />
        </div>
      </div>

      {companyError && <p className="text-[12.5px] text-signal">{companyError}</p>}
    </div>
  );
}
