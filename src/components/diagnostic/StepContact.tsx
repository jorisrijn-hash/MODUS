"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ValidatedInput } from "@/components/diagnostic/ValidatedInput";
import { PhoneInput } from "@/components/diagnostic/PhoneInput";
import { OptionGrid } from "@/components/diagnostic/OptionGrid";
import {
  nameSchema,
  emailSchema,
  isFreeEmailDomain,
  isDisposableEmailDomain,
  translateValidationMessage,
} from "@/lib/diagnostic/schema";
import { getRoleOptions, pick } from "@/lib/diagnostic/questions";
import type { DiagnosticAnswers } from "@/lib/diagnostic/types";
import { useDict, useLocale } from "@/lib/i18n/context";

export function StepContact({
  answers,
  update,
  errors,
  setErrors,
}: {
  answers: DiagnosticAnswers;
  update: <K extends keyof DiagnosticAnswers>(key: K, value: DiagnosticAnswers[K]) => void;
  errors: Record<string, string | null>;
  setErrors: (fn: (prev: Record<string, string | null>) => Record<string, string | null>) => void;
}) {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.diagnosticSteps.contact;
  const roleOptions = getRoleOptions(locale);
  const [emailTouchedFree, setEmailTouchedFree] = useState(false);
  const showFreeEmailNote =
    emailTouchedFree && answers.email && !errors.email && isFreeEmailDomain(answers.email);
  const showDisposableEmailNote =
    emailTouchedFree && answers.email && !errors.email && isDisposableEmailDomain(answers.email);

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ValidatedInput
          label={t.firstNameLabel}
          required
          value={answers.firstName}
          maxLength={60}
          onChange={(v) => update("firstName", v)}
          error={errors.firstName}
          onValidate={() => {
            const r = nameSchema.safeParse(answers.firstName);
            setErrors((p) => ({
              ...p,
              firstName: r.success ? null : translateValidationMessage(r.error.issues[0]?.message ?? "", locale),
            }));
          }}
        />
        <ValidatedInput
          label={t.lastNameLabel}
          required
          value={answers.lastName}
          maxLength={60}
          onChange={(v) => update("lastName", v)}
          error={errors.lastName}
          onValidate={() => {
            const r = nameSchema.safeParse(answers.lastName);
            setErrors((p) => ({
              ...p,
              lastName: r.success ? null : translateValidationMessage(r.error.issues[0]?.message ?? "", locale),
            }));
          }}
        />
      </div>

      <div>
        <ValidatedInput
          label={t.emailLabel}
          required
          type="email"
          value={answers.email}
          onChange={(v) => update("email", v)}
          error={errors.email}
          onValidate={() => {
            const r = emailSchema.safeParse(answers.email);
            setErrors((p) => ({
              ...p,
              email: r.success ? null : translateValidationMessage(r.error.issues[0]?.message ?? "", locale),
            }));
            setEmailTouchedFree(true);
          }}
          placeholder={t.emailPlaceholder}
        />
        <AnimatePresence>
          {showFreeEmailNote && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 text-[12px] text-muted"
            >
              {t.freeEmailNote}
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showDisposableEmailNote && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 text-[12px] text-muted"
            >
              {t.disposableEmailNote}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <PhoneInput value={answers.phone} onChange={(v) => update("phone", v)} />

      <div>
        <p className="text-[14px] font-medium text-ink">{t.roleLabel}</p>
        <div className="mt-2.5">
          <OptionGrid
            options={roleOptions}
            selected={answers.role ? [answers.role] : []}
            onToggle={(v) => update("role", v)}
            columns={3}
          />
        </div>
        {answers.role === pick("roleOptions", "Other", locale) && (
          <div className="mt-3">
            <ValidatedInput
              label={t.roleOtherLabel}
              value={answers.roleOther}
              maxLength={80}
              onChange={(v) => update("roleOther", v)}
            />
          </div>
        )}
      </div>

      {answers.companyName && (
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
          {t.companyPrefix} {answers.companyName}
        </p>
      )}
    </div>
  );
}
