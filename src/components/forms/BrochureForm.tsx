"use client";

import { Download } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormError, FormSuccess } from "@/components/forms/FormStatus";
import { useLeadForm } from "@/components/forms/useLeadForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Honeypot } from "@/components/ui/Honeypot";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { BROCHURE } from "@/lib/constants/site";
import {
  LEAD_FORMS,
  brochureSchema,
  type BrochureInput,
} from "@/lib/validation/schemas";
import type { Course } from "@/types";

/**
 * Brochure request.
 *
 * While `BROCHURE.href` is null the PDF is emailed by the team; as soon as the
 * file is uploaded the success state offers the download directly. Nothing else
 * in the flow changes.
 */
export function BrochureForm({ courses }: { courses: Course[] }) {
  const lead = useLeadForm(LEAD_FORMS.brochure, ANALYTICS_EVENTS.brochureSubmit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrochureInput>({ resolver: zodResolver(brochureSchema), mode: "onBlur" });

  if (lead.isSuccess) {
    return (
      <FormSuccess
        title={BROCHURE.href ? "Your brochure is ready." : "Request received."}
        description={
          BROCHURE.href
            ? "Download it below — we have also emailed you a copy."
            : "We will email the brochure shortly. If it does not arrive, check your spam folder or call the centre."
        }
        action={
          BROCHURE.href ? (
            <ButtonLink href={BROCHURE.href} download variant="primary" size="lg">
              <Download aria-hidden className="size-4.5" />
              Download the brochure
            </ButtonLink>
          ) : undefined
        }
      />
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await lead.submit(values, { source: "brochure-page", course: values.course });
      })}
      className="border border-line border-t-4 border-t-indigo bg-white p-6 sm:p-8"
    >
      <h2 className="text-h3 font-bold tracking-tight">Get the brochure</h2>
      <p className="mt-3 text-body text-ink-secondary">{BROCHURE.note}</p>

      <Honeypot registration={register("honeypot")} />

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field id="brochure-name" label="Full name" required error={errors.name?.message}>
          <Input
            id="brochure-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field
          id="brochure-phone"
          label="Mobile number"
          required
          error={errors.phone?.message}
        >
          <Input
            id="brochure-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Field id="brochure-email" label="Email" required error={errors.email?.message}>
          <Input
            id="brochure-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field
          id="brochure-course"
          label="Programme you are interested in"
          error={errors.course?.message}
        >
          <Select id="brochure-course" defaultValue="" {...register("course")}>
            <option value="">Not sure yet</option>
            {courses.map((course) => (
              <option key={course.id} value={course.title}>
                {course.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {lead.errorMessage ? (
        <div className="mt-6">
          <FormError>{lead.errorMessage}</FormError>
        </div>
      ) : null}

      <Button type="submit" size="lg" className="mt-7" disabled={lead.isSubmitting}>
        {lead.isSubmitting ? "Sending…" : "Send me the brochure"}
      </Button>
    </form>
  );
}
