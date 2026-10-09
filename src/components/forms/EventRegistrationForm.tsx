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
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  LEAD_FORMS,
  eventRegistrationSchema,
  type EventRegistrationInput,
} from "@/lib/validation/schemas";
import type { Event } from "@/types";

interface EventRegistrationFormProps {
  events: Event[];
  /** Copy changes when nothing is scheduled yet. */
  mode: "register" | "interest";
}

export function EventRegistrationForm({ events, mode }: EventRegistrationFormProps) {
  const lead = useLeadForm(LEAD_FORMS.event, ANALYTICS_EVENTS.eventRegister);
  const isInterest = mode === "interest";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventRegistrationInput>({
    resolver: zodResolver(eventRegistrationSchema),
    mode: "onBlur",
    defaultValues: isInterest ? { eventId: "orientation-interest" } : undefined,
  });

  if (lead.isSuccess) {
    return (
      <FormSuccess
        title={isInterest ? "You're on the list." : "Your seat is reserved."}
        description={
          isInterest
            ? "We will contact you as soon as the next orientation date is confirmed."
            : "We will send the venue details and a reminder before the session."
        }
      />
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await lead.submit(values, { source: "events-page", event: values.eventId });
      })}
      className="border border-line border-t-4 border-t-indigo bg-white p-6 sm:p-8"
    >
      <h2 className="text-h3 font-bold tracking-tight">
        {isInterest ? "Register your interest" : "Reserve your seat"}
      </h2>
      <p className="mt-3 text-body text-ink-secondary">
        {isInterest
          ? "Orientation dates are being finalised. Leave your details and we will tell you first — the session is free."
          : "Sessions are free and seats are limited, so we confirm each registration by phone."}
      </p>

      <Honeypot registration={register("honeypot")} />

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field id="event-name" label="Full name" required error={errors.name?.message}>
          <Input
            id="event-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field id="event-phone" label="Mobile number" required error={errors.phone?.message}>
          <Input
            id="event-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Field
          id="event-email"
          label="Email"
          required
          error={errors.email?.message}
          className={isInterest ? "sm:col-span-2" : undefined}
        >
          <Input
            id="event-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        {isInterest ? (
          <input type="hidden" {...register("eventId")} />
        ) : (
          <Field id="event-id" label="Session" required error={errors.eventId?.message}>
            <Select
              id="event-id"
              defaultValue=""
              aria-invalid={Boolean(errors.eventId)}
              {...register("eventId")}
            >
              <option value="" disabled>
                Select
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      {lead.errorMessage ? (
        <div className="mt-6">
          <FormError>{lead.errorMessage}</FormError>
        </div>
      ) : null}

      <Button type="submit" size="lg" className="mt-7" disabled={lead.isSubmitting}>
        {lead.isSubmitting
          ? "Sending…"
          : isInterest
            ? "Notify me about the next session"
            : "Reserve Your Seat"}
      </Button>
    </form>
  );
}
