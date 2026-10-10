"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormError } from "@/components/forms/FormStatus";
import { useLeadForm } from "@/components/forms/useLeadForm";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Honeypot } from "@/components/ui/Honeypot";
import { Input } from "@/components/ui/Input";
import Link from "@/i18n/Link";
import { usePathnameWithoutLocale } from "@/i18n/usePathnameWithoutLocale";
import { track } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/site";
import { LEAD_SUBMITTED_KEY, readFlag, writeFlag } from "@/lib/leads/visitor-flags";
import { LEAD_FORMS, honeypotField, nameField, phoneField } from "@/lib/validation/schemas";

/**
 * One last offer to a desktop visitor who is about to leave: a free
 * counselling callback for a name and a number.
 *
 * Restraint is the feature. It fires only when the pointer leaves through the
 * top of the window (towards the tab bar or address bar), only after the
 * visitor has spent a while on the site, at most once a fortnight, never on a
 * page that already hosts a form, and never for someone who has already sent
 * us one. Phones are left out: there is no reliable "about to leave" signal on
 * touch, and the sticky bottom bar already carries the same offer.
 *
 * Built on `<dialog>` with `showModal()`, so focus trapping, Escape and the
 * inert background come from the browser rather than from code here.
 */

const SHOWN_AT_KEY = "vidyant:exit-offer-shown-at";
const QUIET_DAYS = 14;
/** Someone who leaves in the first few seconds was never going to enquire. */
const MIN_DWELL_MS = 20_000;

/** Pages whose whole purpose is a form — interrupting them costs a conversion. */
const SUPPRESSED_ON: string[] = [
  ROUTES.counselling,
  ROUTES.demo,
  ROUTES.contact,
  ROUTES.enrol,
  ROUTES.brochure,
  ROUTES.login,
  ROUTES.parents,
];

const schema = z.object({ name: nameField, phone: phoneField, honeypot: honeypotField });
type Values = z.input<typeof schema>;

function recentlyShown(): boolean {
  const shownAt = Number(readFlag(SHOWN_AT_KEY));
  return Number.isFinite(shownAt) && Date.now() - shownAt < QUIET_DAYS * 24 * 60 * 60 * 1000;
}

export function ExitIntentOffer() {
  const pathname = usePathnameWithoutLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [armed, setArmed] = useState(false);
  const lead = useLeadForm(LEAD_FORMS.callback, ANALYTICS_EVENTS.callbackSubmit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });

  // The mock test's own pages: the landing page is a form, the result page is
  // already the best offer we have.
  const suppressed = SUPPRESSED_ON.includes(pathname) || pathname.startsWith(ROUTES.mockTest);

  // Arm once, after the dwell time, for desktop pointers only.
  useEffect(() => {
    if (armed || suppressed) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (readFlag(LEAD_SUBMITTED_KEY) || recentlyShown()) return;

    const timer = window.setTimeout(() => setArmed(true), MIN_DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [armed, suppressed]);

  useEffect(() => {
    if (!armed || suppressed) return;

    function onLeave(event: MouseEvent) {
      // Leaving through the top edge, out of the document entirely.
      if (event.relatedTarget !== null || event.clientY > 0) return;
      // Re-checked here: a form sent in another tab since arming counts.
      if (readFlag(LEAD_SUBMITTED_KEY) || recentlyShown()) return;

      document.removeEventListener("mouseout", onLeave);
      writeFlag(SHOWN_AT_KEY, String(Date.now()));
      dialogRef.current?.showModal();
      track(ANALYTICS_EVENTS.exitOfferShown, { page: pathname });
    }

    document.addEventListener("mouseout", onLeave);
    return () => document.removeEventListener("mouseout", onLeave);
  }, [armed, suppressed, pathname]);

  function close() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="exit-offer-title"
      // A click on the backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] border-2 border-indigo bg-white p-0 text-ink backdrop:bg-indigo-900/60"
    >
      <div aria-hidden className="h-1.5 bg-kesar" />
      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 flex size-10 items-center justify-center text-ink-secondary hover:bg-paper hover:text-indigo"
        >
          <X aria-hidden className="size-5" />
        </button>

        {lead.isSuccess ? (
          <div role="status">
            <h2 id="exit-offer-title" className="text-h3 font-bold text-indigo">
              We will call you.
            </h2>
            <p className="mt-3 text-body text-ink-secondary">
              A counsellor will ring you in working hours. Meanwhile, the UPSC guide covers
              eligibility, the exam pattern and the syllabus.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={close}>Close</Button>
              <Link
                href={ROUTES.upscGuide}
                onClick={close}
                className="inline-flex h-12 items-center text-small font-bold text-indigo underline decoration-kesar decoration-2 underline-offset-4"
              >
                Read the UPSC guide
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 id="exit-offer-title" className="pr-8 text-h3 font-bold text-indigo">
              Before you go — a free 20-minute plan for your attempt?
            </h2>
            <p className="mt-3 text-body text-ink-secondary">
              Leave a number and a counsellor will call you back. You get a written roadmap
              for your attempt, whether or not you join.
            </p>

            <form
              noValidate
              onSubmit={handleSubmit(async (values) => {
                await lead.submit(values, { source: "exit-intent" });
              })}
              className="mt-6 space-y-4"
            >
              <Honeypot registration={register("honeypot")} />
              <Field id="exit-name" label="Your name" required error={errors.name?.message}>
                <Input id="exit-name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
              </Field>
              <Field id="exit-phone" label="Mobile number" required error={errors.phone?.message}>
                <Input
                  id="exit-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  {...register("phone")}
                />
              </Field>

              {lead.errorMessage ? <FormError>{lead.errorMessage}</FormError> : null}

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Button type="submit" disabled={lead.isSubmitting}>
                  {lead.isSubmitting ? "Sending…" : "Call me back"}
                </Button>
                <button
                  type="button"
                  onClick={close}
                  className="text-small text-ink-secondary underline underline-offset-4 hover:text-indigo"
                >
                  No thanks
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
