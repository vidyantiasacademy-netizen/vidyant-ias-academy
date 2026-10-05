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
    <div className="overflow-hidden rounded-xl border border-line bg-white text-ink shadow-[0_18px_48px_-30px_rgb(11_63_49/0.35)]">
      <div
        aria-hidden
        className="h-1 bg-gradient-to-r from-kesar via-kesar to-kesar-600"
      />
      <div className="p-6 sm:p-7">
        <p className="flex items-center gap-2.5 text-eyebrow font-semibold uppercase text-kesar-600">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-kesar opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-kesar" />
          </span>
          Admissions open · {EXAM_CYCLE.label}
        </p>

        {lead.isSuccess ? (
          <div role="status" className="mt-5">
            <span className="flex size-11 items-center justify-center rounded-full bg-success-50 text-success">
              <Check aria-hidden className="size-5.5" />
            </span>
            <h2 className="mt-4 text-h4 font-semibold text-indigo">
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
            <h2 className="mt-4 text-h4 font-semibold text-indigo">
              Talk to an academic counsellor
            </h2>
            <p className="mt-2 text-small text-ink-secondary">
              Three fields. We call you back and answer whatever you need to
              decide.
            </p>

            <Honeypot registration={register("honeypot")} />

            <div className="mt-6 grid gap-4">
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
            </div>

            {lead.errorMessage ? (
              <div className="mt-5">
                <FormError>{lead.errorMessage}</FormError>
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              fullWidth
              className="mt-6"
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

            <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
              {ASSURANCES.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-small text-ink-secondary"
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
              className="mt-4 justify-start px-0"
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
