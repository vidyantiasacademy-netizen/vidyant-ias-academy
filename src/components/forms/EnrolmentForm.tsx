"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormError, FormSuccess } from "@/components/forms/FormStatus";
import { useLeadForm } from "@/components/forms/useLeadForm";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Honeypot } from "@/components/ui/Honeypot";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  ATTEMPT_OPTIONS,
  ATTENDANCE_MODES,
  LEAD_FORMS,
  emailField,
  enrolmentSchema,
  nameField,
  phoneField,
  type EnrolmentInput,
} from "@/lib/validation/schemas";
import type { Batch, Course } from "@/types";

interface EnrolmentFormProps {
  courses: Course[];
  /** Confirmed batches. Empty means no batch dropdown is shown. */
  batches: Batch[];
  /** Pre-selects a programme when the visitor arrives from a course page. */
  defaultCourse?: string;
  /** What a signed-in visitor's profile already holds; those fields are not asked again. */
  applicant?: Partial<EnrolmentInput>;
}

/**
 * Enrolment request — the "Enroll Now" destination.
 * Admission is confirmed by the academic team, so this captures intent and the
 * details the team needs rather than pretending to take a payment.
 */
export function EnrolmentForm({ courses, batches, defaultCourse, applicant }: EnrolmentFormProps) {
  const lead = useLeadForm(LEAD_FORMS.enrolment, ANALYTICS_EVENTS.enrolSubmit);

  // A stored value is only trusted — and its field hidden — if it would pass
  // validation; otherwise the error would sit on a field nobody can see.
  const known = {
    name: nameField.safeParse(applicant?.name).success,
    phone: phoneField.safeParse(applicant?.phone).success,
    email: emailField.safeParse(applicant?.email).success,
  };
  const knownDetails = [
    known.name && applicant?.name,
    known.phone && applicant?.phone,
    known.email && applicant?.email,
  ].filter(Boolean);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrolmentInput>({
    resolver: zodResolver(enrolmentSchema),
    mode: "onBlur",
    defaultValues: {
      name: known.name ? applicant?.name : undefined,
      phone: known.phone ? applicant?.phone : undefined,
      email: known.email ? applicant?.email : undefined,
      course: defaultCourse,
      attempt: applicant?.attempt,
    },
  });

  if (lead.isSuccess) {
    return (
      <FormSuccess
        title="Enrolment request received."
        description="Our academic team will call you to confirm the batch, the fee structure and the documents needed. Nothing is charged until you have spoken to us."
      />
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await lead.submit(values, { source: "enrol-page", course: values.course });
      })}
      className="border border-line border-t-4 border-t-indigo bg-white p-6 sm:p-8"
    >
      <h2 className="text-h3 font-bold tracking-tight">Start your enrolment</h2>
      <p className="mt-3 text-body text-ink-secondary">
        Tell us where you are in your preparation. We confirm the batch, the fee structure
        and the instalment options on a call — there is no payment on this page.
      </p>

      <Honeypot registration={register("honeypot")} />

      {knownDetails.length > 0 ? (
        <p className="mt-6 border border-line bg-paper px-4 py-3 text-small text-ink-secondary">
          Enrolling as <span className="font-semibold text-ink">{knownDetails.join(" · ")}</span> —
          from your account.
        </p>
      ) : null}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        {known.name ? null : (
          <Field id="enrol-name" label="Full name" required error={errors.name?.message}>
            <Input
              id="enrol-name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </Field>
        )}

        {known.phone ? null : (
          <Field id="enrol-phone" label="Mobile number" required error={errors.phone?.message}>
            <Input
              id="enrol-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              {...register("phone")}
            />
          </Field>
        )}

        {known.email ? null : (
          <Field id="enrol-email" label="Email" required error={errors.email?.message}>
            <Input
              id="enrol-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </Field>
        )}

        <Field id="enrol-course" label="Programme" required error={errors.course?.message}>
          <Select
            id="enrol-course"
            defaultValue={defaultCourse ?? ""}
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

        {batches.length > 0 ? (
          <Field id="enrol-batch" label="Preferred batch" error={errors.batch?.message}>
            <Select id="enrol-batch" defaultValue="" {...register("batch")}>
              <option value="">Advise me</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.title}>
                  {batch.title}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Field id="enrol-attempt" label="Attempt status" required error={errors.attempt?.message}>
          <Select
            id="enrol-attempt"
            defaultValue={applicant?.attempt ?? ""}
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
          id="enrol-mode"
          label="How you want to attend"
          required
          error={errors.mode?.message}
          className={batches.length > 0 ? undefined : "sm:col-span-2"}
        >
          <Select
            id="enrol-mode"
            defaultValue=""
            aria-invalid={Boolean(errors.mode)}
            {...register("mode")}
          >
            <option value="" disabled>
              Select
            </option>
            {ATTENDANCE_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="enrol-message"
          label="Anything we should know"
          error={errors.message?.message}
          className="sm:col-span-2"
        >
          <Textarea id="enrol-message" rows={4} {...register("message")} />
        </Field>
      </div>

      {lead.errorMessage ? (
        <div className="mt-6">
          <FormError>{lead.errorMessage}</FormError>
        </div>
      ) : null}

      <Button type="submit" size="lg" className="mt-7" disabled={lead.isSubmitting}>
        {lead.isSubmitting ? "Sending…" : "Submit enrolment request"}
      </Button>
    </form>
  );
}
