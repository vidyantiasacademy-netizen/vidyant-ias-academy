"use client";

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
import { ROUTES } from "@/lib/constants/site";
import {
  ATTEMPT_OPTIONS,
  DEMO_SLOTS,
  LEAD_FORMS,
  demoRegistrationSchema,
  type DemoRegistrationInput,
} from "@/lib/validation/schemas";
import type { Course } from "@/types";

/** Today, in the yyyy-mm-dd format the date input expects. */
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function DemoForm({ courses }: { courses: Course[] }) {
  const lead = useLeadForm(LEAD_FORMS.demo, ANALYTICS_EVENTS.demoSubmit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemoRegistrationInput>({
    resolver: zodResolver(demoRegistrationSchema),
    mode: "onBlur",
  });

  if (lead.isSuccess) {
    return (
      <FormSuccess
        title="You're registered."
        description="Our team will contact you with the class details — the batch, the venue or joining link, and what to bring."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={ROUTES.counselling} variant="primary">
              Book Free Counselling
            </ButtonLink>
            <ButtonLink href={ROUTES.courses} variant="secondary">
              Explore Courses
            </ButtonLink>
          </div>
        }
      />
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await lead.submit(values, {
          source: "demo-page",
          course: values.course,
        });
      })}
      className="relative rounded-lg border border-line bg-white p-6 sm:p-8"
    >
      <Honeypot registration={register("honeypot")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="demo-name" label="Full name" required error={errors.name?.message}>
          <Input
            id="demo-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field
          id="demo-phone"
          label="Mobile number"
          required
          error={errors.phone?.message}
        >
          <Input
            id="demo-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Field id="demo-email" label="Email" required error={errors.email?.message}>
          <Input
            id="demo-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field id="demo-college" label="College / University" error={errors.college?.message}>
          <Input id="demo-college" {...register("college")} />
        </Field>

        <Field
          id="demo-graduation"
          label="Graduation year"
          error={errors.graduationYear?.message}
        >
          <Input
            id="demo-graduation"
            inputMode="numeric"
            {...register("graduationYear")}
          />
        </Field>

        <Field
          id="demo-attempt"
          label="UPSC attempts so far"
          required
          error={errors.attempt?.message}
        >
          <Select
            id="demo-attempt"
            defaultValue=""
            aria-invalid={Boolean(errors.attempt)}
            {...register("attempt")}
          >
            <option value="" disabled>
              Select
            </option>
            {ATTEMPT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="demo-course"
          label="Program you want to see"
          required
          error={errors.course?.message}
        >
          <Select
            id="demo-course"
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
          </Select>
        </Field>

        <Field
          id="demo-date"
          label="Preferred date"
          required
          error={errors.preferredDate?.message}
        >
          <Input
            id="demo-date"
            type="date"
            min={todayIso()}
            aria-invalid={Boolean(errors.preferredDate)}
            {...register("preferredDate")}
          />
        </Field>

        <Field
          id="demo-time"
          label="Preferred time"
          required
          error={errors.preferredTime?.message}
          className="sm:col-span-2"
        >
          <Select
            id="demo-time"
            defaultValue=""
            aria-invalid={Boolean(errors.preferredTime)}
            {...register("preferredTime")}
          >
            <option value="" disabled>
              Select
            </option>
            {DEMO_SLOTS.map((option) => (
              <option key={option} value={option}>
                {option}
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

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={lead.isSubmitting}>
          {lead.isSubmitting ? "Sending…" : "Reserve My Seat"}
        </Button>
        <p className="text-small text-ink-secondary">
          Free demo. We confirm the slot before the class.
        </p>
      </div>
    </form>
  );
}
