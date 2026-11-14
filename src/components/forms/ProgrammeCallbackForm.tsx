"use client";

import { ArrowRight, Check, PhoneCall } from "lucide-react";
import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormError } from "@/components/forms/FormStatus";
import { useLeadForm } from "@/components/forms/useLeadForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Honeypot } from "@/components/ui/Honeypot";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA } from "@/lib/constants/site";
import { recommendCourse, usePrepStage } from "@/lib/prep-stage";
import {
  LEAD_FORMS,
  honeypotField,
  nameField,
  phoneField,
} from "@/lib/validation/schemas";
import type { Course } from "@/types";

/** Three fields only: the shortest path to a conversation. */
const schema = z.object({
  name: nameField,
  phone: phoneField,
  course: z.string().min(1, "Select a programme."),
  honeypot: honeypotField,
});

type Values = z.input<typeof schema>;

const ASSURANCES = ["Free", "No payment", "No obligation"];


/**
 * Callback form for the student comparing programmes. The stage picked in the
 * hero pre-selects the programme that fits it. Lives under the Programs
 * section, not in the hero: the hero gives first, this asks once the student
 * has seen what is on offer.
 */
export function ProgrammeCallbackForm({ courses }: { courses: Course[] }) {
  const lead = useLeadForm(
    LEAD_FORMS.callback,
    ANALYTICS_EVENTS.callbackSubmit,
  );

  const {
    register,
    handleSubmit,
    setValue,
    getFieldState,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });

  // The stage picked in the hero pre-selects the programme that fits it,
  // unless the student has already chosen one here themselves.
  const stage = usePrepStage();
  useEffect(() => {
    if (!stage || getFieldState("course").isDirty) return;
    const pick = recommendCourse(stage, courses);
    if (pick) setValue("course", pick.course.title);
  }, [stage, courses, getFieldState, setValue]);

  return (
    <div className="flex h-full flex-col overflow-hidden border-2 border-indigo bg-white text-ink">
      <div
        aria-hidden
        className="h-1.5 bg-kesar"
      />
      <div className="flex flex-1 flex-col justify-center p-5 lg:p-6">
        <p className="flex items-center gap-2.5 text-eyebrow font-bold uppercase text-kesar-600">
          <span aria-hidden className="size-2 shrink-0 bg-current" />
          Free call with a counsellor
        </p>

        {lead.isSuccess ? (
          <div role="status" className="mt-5">
            <span className="flex size-11 items-center justify-center bg-success-50 text-success">
              <Check aria-hidden className="size-5.5" />
            </span>
            <p className="mt-4 text-h4 font-bold text-indigo">
              We have your number.
            </p>
            <p className="mt-2.5 text-body text-ink-secondary">
              Our academic team calls during working hours to understand where
              you are in your preparation. Nothing is charged, and nothing is
              scheduled without you.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <ButtonLink href={CTA.brochure.href} variant="secondary">
                {CTA.brochure.label}
              </ButtonLink>
              <ButtonLink href={CTA.demo.href} variant="ghost">
                {CTA.demo.label}
              </ButtonLink>
            </div>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={handleSubmit(async (values) => {
              await lead.submit(values, {
                source: "home-programme-advice",
                course: values.course,
              });
            })}
          >
            <Honeypot registration={register("honeypot")} />

            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5">
              <Field
                id="advice-name"
                label="Your name"
                required
                error={errors.name?.message}
              >
                <Input
                  id="advice-name"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
              </Field>

              <Field
                id="advice-phone"
                label="Mobile number"
                required
                error={errors.phone?.message}
              >
                <Input
                  id="advice-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  {...register("phone")}
                />
              </Field>

              <Field
                className="col-span-2"
                id="advice-course"
                label="I'm interested in"
                required
                error={errors.course?.message}
              >
                <Select
                  id="advice-course"
                  defaultValue=""
                  aria-invalid={Boolean(errors.course)}
                  {...register("course")}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.title}>
                      {course.title}
                    </option>
                  ))}
                  <option value="Not sure yet">Not sure yet — advise me</option>
                </Select>
              </Field>

              <Button
                type="submit"
                fullWidth
                className="col-span-2 mt-1 whitespace-nowrap"
                disabled={lead.isSubmitting}
              >
                {lead.isSubmitting ? (
                  "Sending…"
                ) : (
                  <>
                    <PhoneCall aria-hidden className="size-4.5" />
                    Call me back
                  </>
                )}
              </Button>
            </div>

            {lead.errorMessage ? (
              <div className="mt-5">
                <FormError>{lead.errorMessage}</FormError>
              </div>
            ) : null}

            <ul className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              {ASSURANCES.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1 text-[0.8125rem] text-ink-secondary"
                >
                  <Check aria-hidden className="size-3.5 text-kesar-600" />
                  {item}
                </li>
              ))}
            </ul>

            <ButtonLink
              href={CTA.counselling.href}
              variant="link"
              size="sm"
              className="mt-1 justify-start px-0"
            >
              Or book a full counselling session
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>

          </form>
        )}
      </div>
    </div>
  );
}
