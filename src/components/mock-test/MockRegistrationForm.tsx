"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/forms/FormStatus";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Honeypot } from "@/components/ui/Honeypot";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { track } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { toAppError } from "@/lib/errors";
import { readLeadContext } from "@/lib/leads/client";
import { LEAD_SUBMITTED_KEY, writeFlag } from "@/lib/leads/visitor-flags";
import { registerForMockAction } from "@/lib/mock-test/actions";
import type { PublicSeries } from "@/lib/mock-test/types";
import {
  mockTestRegistrationSchema,
  type MockTestRegistrationInput,
} from "@/lib/validation/schemas";

/**
 * The only thing standing between a visitor and the paper: a name and a
 * number for the counsellor, then one click on "Continue with Google".
 *
 * The Google sign-in is what makes "one sitting per paper" mean anything —
 * without it, any typed number bought another attempt. It also replaces the
 * email field: the address comes verified from Google.
 */

type Registration = ReturnType<typeof mockTestRegistrationSchema.parse>;
type GoogleVerify = typeof import("@/lib/firebase/google-verify");

function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="size-5 shrink-0">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function MockRegistrationForm({
  testId,
  targetAttempts,
  series = "mock",
}: {
  testId: string;
  /** "CSE 2027"… — computed on the server, so it never drifts from the clock there. */
  targetAttempts: string[];
  /** Which list the paper is on — only changes the wording and the lead's source. */
  series?: PublicSeries;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<Registration | null>(null);
  const [busy, setBusy] = useState(false);
  // Stays true through the navigation, so the button cannot be pressed twice.
  const [opening, setOpening] = useState(false);

  // Loaded ahead of the click: a popup opened after an `await` is blocked, so
  // the Google module must already be here when the button is pressed.
  const google = useRef<GoogleVerify | null>(null);
  useEffect(() => {
    void import("@/lib/firebase/google-verify").then((loaded) => {
      google.current = loaded;
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MockTestRegistrationInput>({
    resolver: zodResolver(mockTestRegistrationSchema),
    mode: "onBlur",
  });

  function submitDetails(raw: MockTestRegistrationInput) {
    const values = mockTestRegistrationSchema.parse(raw);
    // Filled honeypot: a bot. Go no further.
    if (values.honeypot) return;
    setError(null);
    setDetails(values);
  }

  async function continueWithGoogle() {
    if (!details) return;
    setError(null);
    setBusy(true);

    let googleToken: string;
    try {
      const verifier = google.current ?? (await import("@/lib/firebase/google-verify"));
      googleToken = await verifier.verifyWithGoogle();
    } catch (caught) {
      setError(toAppError(caught).message);
      setBusy(false);
      return;
    }

    const context = readLeadContext();
    const result = await registerForMockAction({
      name: details.name,
      phone: details.phone,
      targetAttempt: details.targetAttempt ?? "",
      honeypot: "",
      testId,
      googleToken,
      page: context.page,
      source:
        context.source === "website" ? (series === "pyq" ? "pyq-test" : "mock-test") : context.source,
      campaign: context.campaign,
      referrer: context.referrer,
    });

    if (!result.ok) {
      setBusy(false);
      // A field error belongs to the details step; go back to it.
      if (result.fieldErrors && Object.keys(result.fieldErrors).some((field) => field !== "googleToken")) {
        setDetails(null);
      }
      setError(result.message);
      return;
    }

    setOpening(true);
    track(ANALYTICS_EVENTS.mockTestRegister, { testId, series });
    writeFlag(LEAD_SUBMITTED_KEY, "1");
    router.push(`/mock-test/sit/${result.data.attemptId}`);
  }

  if (details) {
    return (
      <div className="space-y-5">
        <p className="text-body text-ink">
          One last step, {details.name.split(/\s+/)[0]}: sign in with Google to open the paper. Each
          Google account can take this test once.{" "}
          <button
            type="button"
            onClick={() => {
              setDetails(null);
              setError(null);
            }}
            className="cursor-pointer font-semibold text-indigo underline decoration-kesar decoration-2 underline-offset-4"
          >
            Change details
          </button>
        </p>

        {error ? <FormError>{error}</FormError> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => void continueWithGoogle()}
            disabled={busy || opening}
          >
            <GoogleMark />
            {busy || opening ? "Opening your paper…" : "Continue with Google"}
          </Button>
          <p className="text-small text-ink-secondary">
            We only use your name and email from Google. Nothing is posted to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(submitDetails)} className="space-y-5">
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
          hint="For a counsellor to go through your result with you."
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

        <Field
          id={`mock-target-${testId}`}
          label="Target attempt"
          error={errors.targetAttempt?.message}
          className="sm:col-span-2"
        >
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
        <Button type="submit" size="lg">
          Continue
        </Button>
        <p className="text-small text-ink-secondary">
          Free. Next, sign in with Google — one attempt per account. The clock starts only when you
          press Begin.
        </p>
      </div>
    </form>
  );
}
