"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/forms/FormStatus";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Honeypot } from "@/components/ui/Honeypot";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { track } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { readLeadContext } from "@/lib/leads/client";
import { LEAD_SUBMITTED_KEY, writeFlag } from "@/lib/leads/visitor-flags";
import { registerForMockAction } from "@/lib/mock-test/actions";
import {
  mockTestRegistrationSchema,
  type MockTestRegistrationInput,
} from "@/lib/validation/schemas";

/**
 * The only thing standing between a visitor and the paper: a name and a
 * number, plus two optional details that make the counsellor's call better.
 *
 * Kept this short on purpose. Every extra required field here is a visitor who
 * leaves before seeing a single question — and a visitor who never sits the
 * paper is a lead without a score.
 */
export function MockRegistrationForm({
  testId,
  targetAttempts,
}: {
  testId: string;
  /** "CSE 2027"… — computed on the server, so it never drifts from the clock there. */
  targetAttempts: string[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // Stays true through the navigation, so the button cannot be pressed twice.
  const [opening, setOpening] = useState(false);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<MockTestRegistrationInput>({
    resolver: zodResolver(mockTestRegistrationSchema),
    mode: "onBlur",
  });

  async function submit(values: MockTestRegistrationInput) {
    setError(null);
    const context = readLeadContext();

    const result = await registerForMockAction({
      ...values,
      testId,
      page: context.page,
      source: context.source === "website" ? "mock-test" : context.source,
      campaign: context.campaign,
      referrer: context.referrer,
    });

    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (messages[0]) {
          setFieldError(field as keyof MockTestRegistrationInput, { message: messages[0] });
        }
      }
      setError(result.message);
      return;
    }

    setOpening(true);
    track(ANALYTICS_EVENTS.mockTestRegister, { testId });
    writeFlag(LEAD_SUBMITTED_KEY, "1");
    router.push(`/mock-test/sit/${result.data.attemptId}`);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      className="space-y-5"
    >
      <Honeypot registration={register("honeypot")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`mock-name-${testId}`} label="Full name" required error={errors.name?.message}>
          <Input
            id={`mock-name-${testId}`}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field
          id={`mock-phone-${testId}`}
          label="Mobile number"
          required
          hint="Your result is tied to this number."
          error={errors.phone?.message}
        >
          <Input
            id={`mock-phone-${testId}`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Field id={`mock-email-${testId}`} label="Email" error={errors.email?.message}>
          <Input
            id={`mock-email-${testId}`}
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field id={`mock-target-${testId}`} label="Target attempt" error={errors.targetAttempt?.message}>
          <Select id={`mock-target-${testId}`} defaultValue="" {...register("targetAttempt")}>
            <option value="">Not decided yet</option>
            {targetAttempts.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {error ? <FormError>{error}</FormError> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={isSubmitting || opening}>
          {isSubmitting || opening ? "Opening your paper…" : "Start the free mock test"}
        </Button>
        <p className="text-small text-ink-secondary">
          Free. The clock starts only when you press Begin on the next screen. A counsellor may
          call to go through your result.
        </p>
      </div>
    </form>
  );
}
