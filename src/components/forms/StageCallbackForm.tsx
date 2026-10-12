"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CalendarDays,
  Check,
  GraduationCap,
  Phone,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormError } from "@/components/forms/FormStatus";
import { useLeadForm } from "@/components/forms/useLeadForm";
import { Button } from "@/components/ui/Button";
import { Honeypot } from "@/components/ui/Honeypot";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { TrackedAnchor } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CONTACT, EXAM_CYCLE, whatsappUrl } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";
import {
  LEAD_FORMS,
  PREPARATION_STAGES,
  honeypotField,
  nameField,
  optionalText,
  phoneField,
} from "@/lib/validation/schemas";

/** Name, number and stage are required; the target attempt is optional. */
const schema = z.object({
  name: nameField,
  phone: phoneField,
  preparationStage: z.enum(PREPARATION_STAGES, "Select where you are."),
  targetAttempt: optionalText(40),
  honeypot: honeypotField,
});

type Values = z.input<typeof schema>;

/** The current cycle and the two after it, plus an honest "not yet". */
const ATTEMPTS = [0, 1, 2]
  .map((offset) => `CSE ${Number(EXAM_CYCLE.year) + offset}`)
  .concat("Not decided yet");

/**
 * A control with its glyph inside the left edge. The label is visually
 * hidden — the placeholder and glyph carry it on screen — but stays the
 * accessible name; errors show under the control as in `Field`.
 */
function IconControl({
  id,
  label,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-secondary"
        />
        {children}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-small text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Phone homepage's callback form: four fields, one button, and a plain line
 * on what the number is used for. On success it says what happens next and
 * offers WhatsApp or a call for anyone who cannot wait.
 */
export function StageCallbackForm() {
  const lead = useLeadForm(LEAD_FORMS.callback, ANALYTICS_EVENTS.callbackSubmit);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });

  if (lead.isSuccess) {
    return (
      <div role="status">
        <span className="flex size-11 items-center justify-center bg-success-50 text-success">
          <Check aria-hidden className="size-5.5" />
        </span>
        <h3 className="mt-4 text-h4 font-bold text-indigo">We have your number.</h3>
        <p className="mt-2 text-body text-ink-secondary">
          Our academic team calls you back during working hours to talk through your attempt.
          Nothing is charged, and nothing is scheduled without you.
        </p>
        <p className="mt-4 text-small font-semibold text-ink">Can&rsquo;t wait?</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <TrackedAnchor
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
            event={ANALYTICS_EVENTS.whatsappClick}
            payload={{ location: "home-callback-success" }}
            className="flex h-12 items-center justify-center gap-2 border border-line-strong text-small font-bold text-indigo"
          >
            <SocialIcon name="whatsapp" className="size-5" />
            WhatsApp
          </TrackedAnchor>
          <TrackedAnchor
            href={`tel:${CONTACT.phoneHref}`}
            event={ANALYTICS_EVENTS.phoneClick}
            payload={{ location: "home-callback-success" }}
            className="flex h-12 items-center justify-center border border-line-strong text-small font-bold text-indigo"
          >
            Call {CONTACT.phoneDisplay}
          </TrackedAnchor>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await lead.submit(values, { source: "home-callback-phone" });
      })}
    >
      <Honeypot registration={register("honeypot")} />

      <div className="grid gap-3">
        <IconControl id="cb-name" label="Your name (required)" icon={UserRound} error={errors.name?.message}>
          <Input
            id="cb-name"
            placeholder="Your name"
            autoComplete="name"
            className="pl-11"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "cb-name-error" : undefined}
            {...register("name")}
          />
        </IconControl>

        <IconControl id="cb-phone" label="Mobile number (required)" icon={Phone} error={errors.phone?.message}>
          <Input
            id="cb-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Mobile number"
            className="pl-11"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "cb-phone-error" : undefined}
            {...register("phone")}
          />
        </IconControl>

        <IconControl
          id="cb-stage"
          label="Preparation stage (required)"
          icon={GraduationCap}
          error={errors.preparationStage?.message}
        >
          <Select
            id="cb-stage"
            defaultValue=""
            className="pl-11 invalid:text-ink-muted"
            required
            aria-invalid={Boolean(errors.preparationStage)}
            aria-describedby={errors.preparationStage ? "cb-stage-error" : undefined}
            {...register("preparationStage")}
          >
            <option value="" disabled>
              Preparation stage
            </option>
            {PREPARATION_STAGES.map((stage) => (
              <option key={stage} value={stage} className="text-ink">
                {stage}
              </option>
            ))}
          </Select>
        </IconControl>

        <IconControl
          id="cb-attempt"
          label="Target attempt (optional)"
          icon={CalendarDays}
          error={errors.targetAttempt?.message}
        >
          <Select
            id="cb-attempt"
            defaultValue=""
            className={cn("pl-11 has-[option[value='']:checked]:text-ink-muted")}
            {...register("targetAttempt")}
          >
            <option value="">Target attempt (optional)</option>
            {ATTEMPTS.map((attempt) => (
              <option key={attempt} value={attempt} className="text-ink">
                {attempt}
              </option>
            ))}
          </Select>
        </IconControl>

        <Button type="submit" variant="kesar" size="lg" fullWidth disabled={lead.isSubmitting}>
          {lead.isSubmitting ? (
            "Sending…"
          ) : (
            <>
              Request a callback
              <ArrowRight aria-hidden className="size-5" />
            </>
          )}
        </Button>
      </div>

      {lead.errorMessage ? (
        <div className="mt-4">
          <FormError>{lead.errorMessage}</FormError>
        </div>
      ) : null}

      <p className="mt-4 flex items-start justify-center gap-2 text-center text-small text-ink-secondary">
        <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-indigo" />
        No spam. We only use it to call you back.
      </p>
    </form>
  );
}
