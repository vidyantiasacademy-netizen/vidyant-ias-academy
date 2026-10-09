"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormError, FormSuccess } from "@/components/forms/FormStatus";
import { useLeadForm } from "@/components/forms/useLeadForm";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Honeypot } from "@/components/ui/Honeypot";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  CALLBACK_TOPICS,
  COUNSELLING_SLOTS,
  LEAD_FORMS,
  callbackSchema,
} from "@/lib/validation/schemas";
import { cn } from "@/lib/utils/cn";

/** This block renders both selects, so it requires what the server allows. */
const schema = callbackSchema.extend({
  topic: z.enum(CALLBACK_TOPICS, "Select what the call is about."),
  preferredTime: z.enum(COUNSELLING_SLOTS, "Choose a preferred time."),
});

type Values = z.input<typeof schema>;

interface CallbackFormProps {
  /** Recorded with the lead so the team knows which block converted. */
  source: string;
  /** Anchor target for "Request a Callback" links. */
  id?: string;
  className?: string;
  /** `h2` on a page, `h3` inside a section that already has one. */
  as?: "h2" | "h3";
}

/**
 * The shortest conversion on the site: four fields, no email required.
 * Used by the homepage contact block and the contact page.
 */
export function CallbackForm({
  source,
  id,
  className,
  as: Heading = "h2",
}: CallbackFormProps) {
  const lead = useLeadForm(LEAD_FORMS.callback, ANALYTICS_EVENTS.callbackSubmit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });

  if (lead.isSuccess) {
    return (
      <FormSuccess
        title="We will call you."
        description="Our academic team calls within the slot you chose. If you need us sooner, call the centre or message us on WhatsApp."
      />
    );
  }

  return (
    <form
      id={id}
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await lead.submit(values, { source });
      })}
      className={cn(
        "scroll-mt-28 border border-line border-t-4 border-t-indigo bg-white p-6 sm:p-8",
        className,
      )}
    >
      <Heading className="text-h3 font-bold tracking-tight">Request a callback</Heading>
      <p className="mt-3 text-body text-ink-secondary">
        Leave a number and a time that suits you. No email needed, and no obligation to
        enrol.
      </p>

      <Honeypot registration={register("honeypot")} />

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field id="callback-name" label="Full name" required error={errors.name?.message}>
          <Input
            id="callback-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field
          id="callback-phone"
          label="Mobile number"
          required
          error={errors.phone?.message}
        >
          <Input
            id="callback-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Field id="callback-topic" label="What is the call about" required error={errors.topic?.message}>
          <Select
            id="callback-topic"
            defaultValue=""
            aria-invalid={Boolean(errors.topic)}
            {...register("topic")}
          >
            <option value="" disabled>
              Select
            </option>
            {CALLBACK_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="callback-time"
          label="Preferred time"
          required
          error={errors.preferredTime?.message}
        >
          <Select
            id="callback-time"
            defaultValue=""
            aria-invalid={Boolean(errors.preferredTime)}
            {...register("preferredTime")}
          >
            <option value="" disabled>
              Select
            </option>
            {COUNSELLING_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="callback-email"
          label="Email"
          error={errors.email?.message}
          className="sm:col-span-2"
        >
          <Input
            id="callback-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>
      </div>

      {lead.errorMessage ? (
        <div className="mt-6">
          <FormError>{lead.errorMessage}</FormError>
        </div>
      ) : null}

      <Button type="submit" size="lg" className="mt-7" disabled={lead.isSubmitting}>
        {lead.isSubmitting ? "Sending…" : "Request a callback"}
      </Button>
    </form>
  );
}
