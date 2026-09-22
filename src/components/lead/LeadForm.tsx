"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { goalOptions } from "@/content/goals";
import { getSessionAttribution } from "@/lib/attribution";
import {
  getEmptyTurnstileToken,
  submitLeadToApi,
  type GetTurnstileToken,
  type SubmitLead,
} from "@/lib/lead-client";
import {
  noopTrackLeadEvent,
  toLeadAnalyticsParams,
  type TrackLeadEvent,
} from "@/lib/lead-analytics";
import {
  createLeadFormSchema,
  createLeadPayloadSchema,
  type LeadFormData,
  type LeadFormInput,
} from "@/lib/lead-schema";
import type { Locale } from "@/types/content";
import type { Audience, ContactMethod, StudyMode } from "@/types/lead";
import { useLeadGoal } from "./LeadGoalProvider";

type Step = 1 | 2 | 3;

type LeadFormProps = {
  submitLead?: SubmitLead;
  getTurnstileToken?: GetTurnstileToken;
  trackEvent?: TrackLeadEvent;
};

const audienceOptions: readonly Audience[] = [
  "child",
  "school_student",
  "university_student",
  "adult",
];
const studyModeOptions: readonly StudyMode[] = ["offline", "online", "unsure"];
const contactMethodOptions: readonly ContactMethod[] = ["call", "telegram", "viber", "whatsapp"];

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-brand-black outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/20";
const optionClassName =
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-semibold transition hover:border-black/30 has-[:checked]:border-brand-red has-[:checked]:bg-red-50 has-[:checked]:text-brand-red focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-red";

function InlineError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 text-sm font-medium text-brand-red" id={id} role="alert">
      {message}
    </p>
  );
}

export function LeadForm({
  submitLead = submitLeadToApi,
  getTurnstileToken = getEmptyTurnstileToken,
  trackEvent = noopTrackLeadEvent,
}: LeadFormProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("LeadForm");
  const { selectedGoal } = useLeadGoal();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const hasNavigatedRef = useRef(false);
  const previousSelectedGoalRef = useRef(selectedGoal);
  const formSchema = useMemo(() => createLeadFormSchema(locale), [locale]);
  const payloadSchema = useMemo(() => createLeadPayloadSchema(locale), [locale]);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput, unknown, LeadFormData>({
    resolver: zodResolver(formSchema),
    shouldUnregister: false,
    defaultValues: {
      ageOrGrade: "",
      goals: [],
      name: "",
      phone: "",
      comment: "",
      consent: false,
    },
  });

  useEffect(() => {
    getSessionAttribution();
  }, []);

  useEffect(() => {
    if (!selectedGoal) return;
    const goals = getValues("goals") ?? [];
    if (previousSelectedGoalRef.current === selectedGoal && goals.includes(selectedGoal)) return;
    const withoutPreviousPreselection = previousSelectedGoalRef.current
      ? goals.filter((goal) => goal !== previousSelectedGoalRef.current)
      : goals;
    const nextGoals = withoutPreviousPreselection.includes(selectedGoal)
      ? withoutPreviousPreselection
      : [...withoutPreviousPreselection, selectedGoal];
    previousSelectedGoalRef.current = selectedGoal;
    setValue("goals", nextGoals, { shouldDirty: true, shouldValidate: step === 2 });
  }, [getValues, selectedGoal, setValue, step]);

  useEffect(() => {
    if (!hasNavigatedRef.current) return;
    stepHeadingRef.current?.focus();
  }, [step]);

  const goToStep = (nextStep: Step) => {
    hasNavigatedRef.current = true;
    setStep(nextStep);
  };

  const continueFromStepOne = async () => {
    const valid = await trigger(["audience", "ageOrGrade"], { shouldFocus: true });
    if (!valid) return;
    trackEvent("trial_form_start", { locale, step: 1 });
    trackEvent("trial_form_step_complete", { locale, step: 1 });
    goToStep(2);
  };

  const continueFromStepTwo = async () => {
    const valid = await trigger(["goals", "studyMode"], { shouldFocus: true });
    if (!valid) return;
    trackEvent("trial_form_step_complete", { locale, step: 2 });
    goToStep(3);
  };

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitError(false);

    try {
      const turnstileToken = await getTurnstileToken();
      const payload = payloadSchema.parse({
        ...formData,
        locale,
        attribution: getSessionAttribution(),
        pageUrl: window.location.href,
        turnstileToken,
      });

      trackEvent("trial_form_submit", toLeadAnalyticsParams(payload));
      await submitLead(payload);
      trackEvent("trial_form_success", toLeadAnalyticsParams(payload));
      reset();
      setSubmitted(true);
    } catch {
      setSubmitError(true);
      trackEvent("trial_form_error", {
        locale,
        step: 3,
        goalCount: getValues("goals")?.length ?? 0,
        studyMode: getValues("studyMode"),
        contactMethod: getValues("contactMethod"),
      });
    }
  });

  if (submitted) {
    return (
      <div className="rounded-[1.75rem] border border-emerald-700/20 bg-emerald-50 p-6 sm:p-8" role="status">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">{t("success.eyebrow")}</p>
        <h3 className="mt-3 text-2xl font-bold tracking-[-0.025em] text-brand-black sm:text-3xl">
          {t("success.title")}
        </h3>
        <p className="mt-3 max-w-xl leading-7 text-[var(--text-muted)]">{t("success.body")}</p>
      </div>
    );
  }

  return (
    <form className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-[0_20px_70px_rgba(26,26,26,0.08)] sm:p-8" noValidate onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-5">
        <p className="text-sm font-bold text-brand-black" aria-live="polite">
          {t("progress", { step })}
        </p>
        <ol className="flex gap-2" aria-label={t("progressLabel") }>
          {([1, 2, 3] as const).map((item) => (
            <li
              aria-current={item === step ? "step" : undefined}
              className={`h-2.5 w-10 rounded-full ${item <= step ? "bg-brand-red" : "bg-black/10"}`}
              key={item}
            >
              <span className="sr-only">{t("progressStep", { step: item })}</span>
            </li>
          ))}
        </ol>
      </div>

      {step === 1 ? (
        <div className="pt-7">
          <h3 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl" ref={stepHeadingRef} tabIndex={-1}>
            {t("audience.title")}
          </h3>
          <fieldset aria-describedby={errors.audience ? "audience-error" : undefined} className="mt-6">
            <legend className="sr-only">{t("audience.title")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {audienceOptions.map((option) => (
                <label className={optionClassName} key={option}>
                  <input {...register("audience")} type="radio" value={option} />
                  <span>{t(`audience.options.${option}`)}</span>
                </label>
              ))}
            </div>
            <InlineError id="audience-error" message={errors.audience?.message} />
          </fieldset>

          <label className="mt-6 block text-sm font-semibold" htmlFor="age-or-grade">
            {t("ageOrGrade.label")} <span className="font-normal text-[var(--text-muted)]">{t("optional")}</span>
          </label>
          <input
            {...register("ageOrGrade")}
            aria-describedby={errors.ageOrGrade ? "age-or-grade-error" : undefined}
            aria-invalid={Boolean(errors.ageOrGrade)}
            className={fieldClassName}
            id="age-or-grade"
            maxLength={40}
            placeholder={t("ageOrGrade.placeholder")}
            type="text"
          />
          <InlineError id="age-or-grade-error" message={errors.ageOrGrade?.message} />

          <div className="mt-8 flex justify-end">
            <button className="min-h-12 rounded-full bg-brand-red px-7 py-3 font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red" onClick={continueFromStepOne} type="button">
              {t("actions.next")}
            </button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="pt-7">
          <h3 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl" ref={stepHeadingRef} tabIndex={-1}>
            {t("goals.title")}
          </h3>
          {selectedGoal ? <p className="mt-3 text-sm font-medium text-brand-red">{t("goals.preselected")}</p> : null}
          <fieldset aria-describedby={errors.goals ? "goals-error" : undefined} className="mt-6">
            <legend className="sr-only">{t("goals.title")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {goalOptions.map((goal) => (
                <label className={optionClassName} key={goal.id}>
                  <input {...register("goals")} type="checkbox" value={goal.id} />
                  <span>{goal.label[locale]}</span>
                </label>
              ))}
            </div>
            <InlineError id="goals-error" message={errors.goals?.message} />
          </fieldset>

          <fieldset aria-describedby={errors.studyMode ? "study-mode-error" : undefined} className="mt-8">
            <legend className="text-lg font-bold">{t("studyMode.title")}</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {studyModeOptions.map((option) => (
                <label className={optionClassName} key={option}>
                  <input {...register("studyMode")} type="radio" value={option} />
                  <span>{t(`studyMode.options.${option}`)}</span>
                </label>
              ))}
            </div>
            <InlineError id="study-mode-error" message={errors.studyMode?.message} />
          </fieldset>

          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <button className="min-h-12 rounded-full border border-black/20 px-6 py-3 font-semibold transition hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red" onClick={() => goToStep(1)} type="button">
              {t("actions.back")}
            </button>
            <button className="min-h-12 rounded-full bg-brand-red px-7 py-3 font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red" onClick={continueFromStepTwo} type="button">
              {t("actions.next")}
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="pt-7">
          <h3 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl" ref={stepHeadingRef} tabIndex={-1}>
            {t("contact.title")}
          </h3>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="lead-name">{t("contact.name")}</label>
              <input {...register("name")} aria-describedby={errors.name ? "name-error" : undefined} aria-invalid={Boolean(errors.name)} autoComplete="name" className={fieldClassName} id="lead-name" type="text" />
              <InlineError id="name-error" message={errors.name?.message} />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="lead-phone">{t("contact.phone")}</label>
              <input {...register("phone")} aria-describedby={errors.phone ? "phone-error" : undefined} aria-invalid={Boolean(errors.phone)} autoComplete="tel" className={fieldClassName} id="lead-phone" inputMode="tel" placeholder={t("contact.phonePlaceholder")} type="tel" />
              <InlineError id="phone-error" message={errors.phone?.message} />
            </div>
          </div>

          <fieldset aria-describedby={errors.contactMethod ? "contact-method-error" : undefined} className="mt-7">
            <legend className="text-lg font-bold">{t("contact.methodTitle")}</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {contactMethodOptions.map((option) => (
                <label className={optionClassName} key={option}>
                  <input {...register("contactMethod")} type="radio" value={option} />
                  <span>{t(`contact.methods.${option}`)}</span>
                </label>
              ))}
            </div>
            <InlineError id="contact-method-error" message={errors.contactMethod?.message} />
          </fieldset>

          <label className="mt-7 block text-sm font-semibold" htmlFor="lead-comment">
            {t("contact.comment")} <span className="font-normal text-[var(--text-muted)]">{t("optional")}</span>
          </label>
          <textarea {...register("comment")} aria-describedby={errors.comment ? "comment-error" : "comment-hint"} aria-invalid={Boolean(errors.comment)} className={`${fieldClassName} min-h-28 resize-y`} id="lead-comment" maxLength={500} />
          <p className="mt-2 text-xs text-[var(--text-muted)]" id="comment-hint">{t("contact.commentHint")}</p>
          <InlineError id="comment-error" message={errors.comment?.message} />

          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6">
            <input {...register("consent")} aria-describedby={errors.consent ? "consent-error" : undefined} className="mt-1 size-5 shrink-0 accent-[var(--brand-red)]" type="checkbox" />
            <span>{t("contact.consent")}</span>
          </label>
          <InlineError id="consent-error" message={errors.consent?.message} />

          {submitError ? (
            <p className="mt-6 rounded-xl border border-brand-red/25 bg-red-50 p-4 text-sm font-medium text-brand-red" role="alert">
              {t("error")}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <button className="min-h-12 rounded-full border border-black/20 px-6 py-3 font-semibold transition hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red" onClick={() => goToStep(2)} type="button">
              {t("actions.back")}
            </button>
            <button className="min-h-12 rounded-full bg-brand-red px-7 py-3 font-semibold text-white transition enabled:hover:bg-red-700 disabled:cursor-wait disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red" disabled={isSubmitting} type="submit">
              {isSubmitting ? t("actions.sending") : t("actions.submit")}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
