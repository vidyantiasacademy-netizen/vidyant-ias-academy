"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { FormError } from "@/components/forms/FormStatus";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { homeRouteFor } from "@/lib/auth/roles";
import { sendPasswordReset, signInWithEmail } from "@/lib/auth/client";
import { isAppError } from "@/lib/errors";
import { passwordResetSchema, signInSchema } from "@/lib/validation/auth";

/**
 * Student and staff sign-in.
 *
 * Calls `lib/auth/client`, never `firebase/auth` directly, because every
 * sign-in has a mandatory second half: posting the ID token to
 * `/api/auth/session` so the server gets an httpOnly session cookie. Without
 * that, the browser would look signed in while every Server Component still
 * saw an anonymous visitor.
 *
 * There is no sign-up form on purpose. Accounts are provisioned by the centre
 * when an admission is confirmed, and the counselling funnel already starts at
 * the enquiry forms. For the same reason there is no Google sign-in: a
 * federated provider creates an account for anyone who has one there.
 * `createSession` rejects every provider but email/password server-side.
 */

type SignInValues = z.input<typeof signInSchema>;
type ResetValues = z.input<typeof passwordResetSchema>;

export function SignInForm({ nextPath }: { nextPath: string | null }) {
  const [mode, setMode] = useState<"sign-in" | "reset">("sign-in");

  return mode === "sign-in" ? (
    <SignIn nextPath={nextPath} onForgotPassword={() => setMode("reset")} />
  ) : (
    <ResetPassword onBack={() => setMode("sign-in")} />
  );
}

function message(error: unknown): string {
  // `lib/auth/client` already converts Firebase codes into AppErrors with
  // user-safe wording, so anything else is genuinely unexpected.
  return isAppError(error)
    ? error.message
    : "Something went wrong. Please try again.";
}

function SignIn({
  nextPath,
  onForgotPassword,
}: {
  nextPath: string | null;
  onForgotPassword: () => void;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), mode: "onBlur" });

  /**
   * `nextPath` is already validated server-side as a relative path. Falling
   * back to the role's own landing route matters: a counsellor who signs in at
   * `/login` should arrive at `/admin`, and the proxy cannot work that out
   * because it never verifies the cookie.
   */
  function goOnwards(role: Parameters<typeof homeRouteFor>[0]) {
    router.replace(nextPath ?? homeRouteFor(role));
    // The session cookie was set by a fetch, so the cached RSC payload for the
    // target route was rendered for an anonymous visitor.
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
      <h2 className="text-h3 font-semibold">Sign in</h2>
      <p className="mt-3 text-body text-ink-secondary">
        Use the email address the centre registered for you.
      </p>

      <form
        noValidate
        className="mt-7"
        onSubmit={handleSubmit(async (values) => {
          setFormError(null);
          try {
            const { role } = await signInWithEmail(values.email, values.password);
            goOnwards(role);
          } catch (error) {
            setFormError(message(error));
          }
        })}
      >
        <div className="grid gap-5">
          <Field id="signin-email" label="Email" required error={errors.email?.message}>
            <Input
              id="signin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </Field>

          <Field
            id="signin-password"
            label="Password"
            required
            error={errors.password?.message}
          >
            <Input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </Field>
        </div>

        {formError ? (
          <div className="mt-6">
            <FormError>{formError}</FormError>
          </div>
        ) : null}

        <Button type="submit" size="lg" fullWidth className="mt-7" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <button
        type="button"
        onClick={onForgotPassword}
        className="mt-6 text-small font-semibold text-indigo underline underline-offset-4 hover:text-kesar-600"
      >
        Forgot your password?
      </button>
    </div>
  );
}

function ResetPassword({ onBack }: { onBack: () => void }) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(passwordResetSchema),
    mode: "onBlur",
  });

  return (
    <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
      <h2 className="text-h3 font-semibold">Reset your password</h2>

      {sentTo ? (
        <>
          <p className="mt-3 text-body text-ink-secondary">
            If an account exists for <strong className="text-ink">{sentTo}</strong>, a
            reset link is on its way. Check the spam folder too.
          </p>
          <Button variant="secondary" size="lg" className="mt-7" onClick={onBack}>
            <ArrowLeft aria-hidden className="size-4.5" />
            Back to sign in
          </Button>
        </>
      ) : (
        <>
          <p className="mt-3 text-body text-ink-secondary">
            We will email you a link to set a new one.
          </p>

          <form
            noValidate
            className="mt-7"
            onSubmit={handleSubmit(async (values) => {
              setFormError(null);
              try {
                await sendPasswordReset(values.email);
              } catch (error) {
                // Deliberately not surfaced per-case: "no such user" would
                // confirm which email addresses are registered.
                console.error(error);
              } finally {
                setSentTo(values.email);
              }
            })}
          >
            <Field id="reset-email" label="Email" required error={errors.email?.message}>
              <Input
                id="reset-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </Field>

            {formError ? (
              <div className="mt-6">
                <FormError>{formError}</FormError>
              </div>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send reset link"}
              </Button>
              <Button variant="secondary" size="lg" onClick={onBack}>
                Back to sign in
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
