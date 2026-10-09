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
import { Textarea } from "@/components/ui/Textarea";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/site";
import {
  ATTEMPT_OPTIONS,
  COUNSELLING_SLOTS,
  LEAD_FORMS,
  PREPARATION_LEVELS,
  counsellingSchema,
  type CounsellingInput,
} from "@/lib/validation/schemas";

export function CounsellingForm() {
  const lead = useLeadForm(LEAD_FORMS.counselling, ANALYTICS_EVENTS.counsellingSubmit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CounsellingInput>({
    resolver: zodResolver(counsellingSchema),
    mode: "onBlur",
  });

  if (lead.isSuccess) {
    return (
      <FormSuccess
        title="Thank you."
        description="Our academic counsellor will contact you shortly at your preferred time. If it is urgent, you can also call the centre directly."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={ROUTES.courses} variant="primary">
              Explore Courses
            </ButtonLink>
            <ButtonLink href={ROUTES.resources} variant="secondary">
              Free Resources
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
        await lead.submit(values, { source: "counselling-page" });
      })}
      className="relative border border-line border-t-4 border-t-indigo bg-white p-6 sm:p-8"
    >
      <Honeypot registration={register("honeypot")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full name" required error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field
          id="phone"
          label="Mobile number"
          required
          hint="We call on this number."
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Field id="email" label="Email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field id="age" label="Age" error={errors.age?.message}>
          <Input id="age" inputMode="numeric" {...register("age")} />
        </Field>

        <Field id="college" label="College / University" error={errors.college?.message}>
          <Input id="college" {...register("college")} />
        </Field>

        <Field
          id="graduationYear"
          label="Graduation year"
          error={errors.graduationYear?.message}
        >
          <Input id="graduationYear" inputMode="numeric" {...register("graduationYear")} />
        </Field>

        <Field
          id="workingProfessional"
          label="Are you working?"
          required
          error={errors.workingProfessional?.message}
        >
          <Select
            id="workingProfessional"
            defaultValue=""
            aria-invalid={Boolean(errors.workingProfessional)}
            {...register("workingProfessional")}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </Select>
        </Field>

        <Field
          id="attempt"
          label="UPSC attempts so far"
          required
          error={errors.attempt?.message}
        >
          <Select
            id="attempt"
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
          id="targetAttempt"
          label="Target attempt"
          required
          hint="For example, CSE 2027."
          error={errors.targetAttempt?.message}
        >
          <Input
            id="targetAttempt"
            aria-invalid={Boolean(errors.targetAttempt)}
            {...register("targetAttempt")}
          />
        </Field>

        <Field
          id="optionalSubject"
          label="Optional subject"
          hint="Leave blank if undecided."
          error={errors.optionalSubject?.message}
        >
          <Input id="optionalSubject" {...register("optionalSubject")} />
        </Field>

        <Field
          id="preparationLevel"
          label="Current preparation level"
          required
          error={errors.preparationLevel?.message}
          className="sm:col-span-2"
        >
          <Select
            id="preparationLevel"
            defaultValue=""
            aria-invalid={Boolean(errors.preparationLevel)}
            {...register("preparationLevel")}
          >
            <option value="" disabled>
              Select
            </option>
            {PREPARATION_LEVELS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="biggestChallenge"
          label="Your biggest challenge right now"
          required
          hint="A sentence or two is enough — it helps the counsellor prepare."
          error={errors.biggestChallenge?.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="biggestChallenge"
            rows={4}
            aria-invalid={Boolean(errors.biggestChallenge)}
            {...register("biggestChallenge")}
          />
        </Field>

        <Field
          id="preferredTime"
          label="Preferred counselling time"
          required
          error={errors.preferredTime?.message}
          className="sm:col-span-2"
        >
          <Select
            id="preferredTime"
            defaultValue=""
            aria-invalid={Boolean(errors.preferredTime)}
            {...register("preferredTime")}
          >
            <option value="" disabled>
              Select
            </option>
            {COUNSELLING_SLOTS.map((option) => (
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
          {lead.isSubmitting ? "Sending…" : "Book Free Counselling"}
        </Button>
        <p className="text-small text-ink-secondary">
          Free, with no obligation to enrol. We use your details only to contact you about
          your enquiry.
        </p>
      </div>
    </form>
  );
}
