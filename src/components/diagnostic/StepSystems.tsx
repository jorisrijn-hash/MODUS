"use client";

import { OptionGrid } from "@/components/diagnostic/OptionGrid";
import { ValidatedInput } from "@/components/diagnostic/ValidatedInput";
import { toggleInArray } from "@/lib/diagnostic/utils";
import {
  getSystemOptions,
  getConnectionLevels,
  getSpreadsheetDependency,
  getAutomationUsage,
  pick,
} from "@/lib/diagnostic/questions";
import type { DiagnosticAnswers } from "@/lib/diagnostic/types";
import { useDict, useLocale } from "@/lib/i18n/context";

export function StepSystems({
  answers,
  update,
}: {
  answers: DiagnosticAnswers;
  update: <K extends keyof DiagnosticAnswers>(key: K, value: DiagnosticAnswers[K]) => void;
}) {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.diagnosticSteps.systems;
  const systemOptions = getSystemOptions(locale);
  const connectionLevels = getConnectionLevels(locale);
  const spreadsheetDependency = getSpreadsheetDependency(locale);
  const automationUsage = getAutomationUsage(locale);
  const noOption = pick("automationUsage", "No", locale);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[15px] font-medium text-ink">{t.systemsTitle}</p>
        <p className="mt-1 text-[12.5px] text-muted">{t.systemsHint}</p>
        <div className="mt-3">
          <OptionGrid
            options={systemOptions}
            selected={answers.systems}
            onToggle={(v) => update("systems", toggleInArray(answers.systems, v))}
            columns={3}
          />
        </div>

        {answers.systems.length > 0 && (
          <div className="mt-4">
            <ValidatedInput
              label={t.specificToolsLabel}
              value={answers.specificTools}
              maxLength={200}
              onChange={(v) => update("specificTools", v)}
              placeholder={t.specificToolsPlaceholder}
            />
          </div>
        )}
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.connectionTitle}</p>
        <p className="mt-1 text-[12.5px] text-muted">{t.connectionHint}</p>
        <div className="mt-3">
          <OptionGrid
            options={[...connectionLevels]}
            selected={answers.connectionLevel ? [answers.connectionLevel] : []}
            onToggle={(v) => update("connectionLevel", v)}
            columns={2}
          />
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.spreadsheetTitle}</p>
        <div className="mt-3">
          <OptionGrid
            options={spreadsheetDependency}
            selected={answers.spreadsheetDependency ? [answers.spreadsheetDependency] : []}
            onToggle={(v) => update("spreadsheetDependency", v)}
            columns={2}
          />
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.automationTitle}</p>
        <div className="mt-3">
          <OptionGrid
            options={automationUsage}
            selected={answers.automationUsage}
            onToggle={(v) => {
              let next: string[];
              if (v === noOption) {
                next = answers.automationUsage.includes(noOption) ? [] : [noOption];
              } else {
                next = toggleInArray(
                  answers.automationUsage.filter((x) => x !== noOption),
                  v
                );
              }
              update("automationUsage", next);
            }}
            columns={2}
          />
        </div>
      </div>
    </div>
  );
}
