"use client";

import { ArrowRight, Check, PhoneCall } from "lucide-react";

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
import { CTA, EXAM_CYCLE } from "@/lib/constants/site";
import {
  LEAD_FORMS,
  honeypotField,
  nameField,
  phoneField,
} from "@/lib/validation/schemas";
import type { Course } from "@/types";

/** Three fields only — the hero is the shortest path to a conversation. */
const schema = z.object({
  name: nameField,
  phone: phoneField,
  course: z.string().min(1, "Select a programme."),
  honeypot: honeypotField,
});

type Values = z.input<typeof schema>;

const ASSURANCES = ["Free", "No payment online", "We call you back"];

/** Same promise as the success message — shown only where there is room. */
const NEXT_STEPS = [
  "We call you back in working hours",
  "We ask where you are in your preparation",
  "Nothing is charged or scheduled without you",
];

export function HeroCallbackForm({ courses }: { courses: Course[] }) {
  const lead = useLeadForm(
    LEAD_FORMS.callback,
    ANALYTICS_EVENTS.callbackSubmit,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });

  return (
    <div className="flex h-full flex-col overflow-hidden border-2 border-indigo bg-white text-ink">
      <div
        aria-hidden
        className="h-1.5 bg-kesar"
      />
      {/* Beside the banner the card stretches to the banner's height; the
          content centres in whatever height that gives. */}
      <div className="flex flex-1 flex-col justify-center p-5 sm:p-6 xl:px-7 xl:py-5">
        {/* Beside the banner the card is as tall as the banner, which grows
            with the screen. Content is added back in steps as that height
            allows, so large screens get substance rather than empty padding:
            xl is compact, 2xl restores the intro, 3xl the counselling link,
            4xl the "what happens next" steps. */}
        <p className="flex items-center gap-2.5 text-eyebrow font-bold uppercase text-kesar-600 xl:hidden 2xl:flex">
          <span aria-hidden className="size-2 shrink-0 bg-current" />
          Admissions open · {EXAM_CYCLE.label}
        </p>

        {lead.isSuccess ? (
          <div role="status" className="mt-5">
            <span className="flex size-11 items-center justify-center bg-success-50 text-success">
              <Check aria-hidden className="size-5.5" />
            </span>
            <h2 className="mt-4 text-h4 font-bold text-indigo">
              We have your number.
            </h2>
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
                source: "home-hero",
                course: values.course,
              });
            })}
          >
            <h2 className="mt-4 text-h4 font-bold text-indigo xl:mt-0 2xl:mt-4 3xl:text-h3">
              Talk to an academic counsellor
            </h2>
            <p className="mt-2 text-small text-ink-secondary xl:hidden 2xl:block">
              Three fields. We call you back and answer whatever you need to
              decide.
            </p>

            <Honeypot registration={register("honeypot")} />

            <div className="mt-5 grid gap-3.5 sm:grid-cols-2 xl:mt-4 xl:gap-3">
              <Field
                id="hero-name"
                label="Full name"
                required
                error={errors.name?.message}
              >
                <Input
                  id="hero-name"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
              </Field>

              <Field
                id="hero-phone"
                label="Mobile number"
                required
                error={errors.phone?.message}
              >
                <Input
                  id="hero-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  {...register("phone")}
                />
              </Field>

              <Field
                id="hero-course"
                label="Programme"
                required
                error={errors.course?.message}
              >
                <Select
                  id="hero-course"
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
                size="lg"
                fullWidth
                className="whitespace-nowrap sm:h-12 sm:self-end xl:px-3 xl:text-small"
                disabled={lead.isSubmitting}
              >
                {lead.isSubmitting ? (
                  "Sending…"
                ) : (
                  <>
                    <PhoneCall aria-hidden className="size-4.5" />
                    Request a callback
                  </>
                )}
              </Button>
            </div>

            {lead.errorMessage ? (
              <div className="mt-5">
                <FormError>{lead.errorMessage}</FormError>
              </div>
            ) : null}

            <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 xl:mt-3 xl:flex-nowrap xl:gap-x-3 xl:border-t-0 xl:pt-0 2xl:mt-4 2xl:gap-x-4 2xl:border-t 2xl:pt-3.5">
              {ASSURANCES.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-small text-ink-secondary xl:gap-1 xl:text-[0.8125rem] 2xl:gap-1.5 2xl:text-small"
                >
                  <Check aria-hidden className="size-4 text-kesar-600" />
                  {item}
                </li>
              ))}
            </ul>

            <ButtonLink
              href={CTA.counselling.href}
              variant="link"
              size="sm"
              className="mt-4 justify-start px-0 xl:hidden 3xl:inline-flex"
            >
              Or book a full counselling session
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>

            <ol className="mt-6 hidden gap-3 border-t border-line pt-5 4xl:grid 4xl:grid-cols-3">
              {NEXT_STEPS.map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center bg-indigo text-small font-bold tabular-nums text-white"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pt-1 text-small text-ink-secondary">{step}</span>
                </li>
              ))}
            </ol>
          </form>
        )}
      </div>
    </div>
  );
}
