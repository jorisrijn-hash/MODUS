"use client";

import { Reorder, useDragControls } from "motion/react";
import { GripVertical } from "lucide-react";
import { OptionGrid } from "@/components/diagnostic/OptionGrid";
import { toggleInArray } from "@/lib/diagnostic/utils";
import {
  getPriorityOptions,
  getTimingOptions,
  getDecisionContextOptions,
  getInterestOptions,
} from "@/lib/diagnostic/questions";
import type { DiagnosticAnswers } from "@/lib/diagnostic/types";
import { useDict, useLocale } from "@/lib/i18n/context";

export function StepPriorities({
  answers,
  update,
}: {
  answers: DiagnosticAnswers;
  update: <K extends keyof DiagnosticAnswers>(key: K, value: DiagnosticAnswers[K]) => void;
}) {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.diagnosticSteps.priorities;
  const priorityOptions = getPriorityOptions(locale);
  const timingOptions = getTimingOptions(locale);
  const decisionContextOptions = getDecisionContextOptions(locale);
  const interestOptions = getInterestOptions(locale);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[15px] font-medium text-ink">{t.interestTitle}</p>
        <p className="mt-1 text-[12.5px] text-muted">{t.interestHint}</p>
        <div className="mt-3">
          <OptionGrid
            options={[...interestOptions]}
            selected={answers.primaryInterest ? [answers.primaryInterest] : []}
            onToggle={(v) => update("primaryInterest", v)}
            columns={2}
          />
        </div>
      </div>

      <div>
        <p className="text-[15px] font-medium text-ink">{t.priorityTitle}</p>
        <p className="mt-1 text-[12.5px] text-muted">{t.chooseUpTo3}</p>
        <div className="mt-3">
          <OptionGrid
            options={priorityOptions}
            selected={answers.priorities}
            onToggle={(v) => update("priorities", toggleInArray(answers.priorities, v, 3))}
            columns={2}
            max={3}
          />
        </div>

        {answers.priorities.length >= 2 && (
          <div className="mt-5">
            <p className="text-[12.5px] font-medium text-ink">{t.rankTitle}</p>
            <p className="mt-0.5 text-[11.5px] text-muted">{t.rankHint}</p>
            <Reorder.Group
              axis="y"
              values={answers.priorities}
              onReorder={(next) => update("priorities", next)}
              className="mt-2.5 space-y-2"
            >
              {answers.priorities.map((priority, i) => (
                <PriorityRankItem
                  key={priority}
                  priority={priority}
                  rank={i + 1}
                  reorderLabel={t.reorderLabel}
                />
              ))}
            </Reorder.Group>
          </div>
        )}
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.timingTitle}</p>
        <div className="mt-3">
          <OptionGrid
            options={timingOptions}
            selected={answers.timing ? [answers.timing] : []}
            onToggle={(v) => update("timing", v)}
            columns={3}
          />
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium text-ink">{t.decisionTitle}</p>
        <div className="mt-3">
          <OptionGrid
            options={[...decisionContextOptions]}
            selected={answers.decisionContext ? [answers.decisionContext] : []}
            onToggle={(v) => update("decisionContext", v)}
            columns={2}
          />
        </div>
      </div>
    </div>
  );
}

function PriorityRankItem({
  priority,
  rank,
  reorderLabel,
}: {
  priority: string;
  rank: number;
  reorderLabel: string;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={priority}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 rounded border border-line bg-paper px-3.5 py-2.5"
    >
      <span className="font-mono text-[11px] text-muted">{rank}</span>
      <span className="flex-1 text-[13.5px] text-graphite">{priority}</span>
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label={`${reorderLabel}: ${priority}`}
        className="cursor-grab touch-none text-muted active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </Reorder.Item>
  );
}
