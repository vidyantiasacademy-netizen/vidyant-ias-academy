"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormError, FormSuccess } from "@/components/forms/FormStatus";
import { useLeadForm } from "@/components/forms/useLeadForm";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Honeypot } from "@/components/ui/Honeypot";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  LEAD_FORMS,
  enquirySchema,
  type EnquiryInput,
} from "@/lib/validation/schemas";

/** `id` lets "Send an Enquiry" links anchor straight to the form. */
export function EnquiryForm({ id }: { id?: string } = {}) {
  const lead = useLeadForm(LEAD_FORMS.enquiry, ANALYTICS_EVENTS.enquirySubmit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnquiryInput>({ resolver: zodResolver(enquirySchema), mode: "onBlur" });

  if (lead.isSuccess) {
    return (
      <FormSuccess
        title="Message received."
        description="Our team will reply during working hours. For anything urgent, call the centre or message us on WhatsApp."
      />
    );
  }

  return (
    <form
      id={id}
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await lead.submit(values, { source: "contact-page" });
      })}
      className="scroll-mt-28 rounded-lg border border-line bg-white p-6 sm:p-8"
    >
      <h2 className="text-h3 font-semibold">Send an enquiry</h2>
      <p className="mt-3 text-body text-ink-secondary">
        Ask anything — fees, batches, schedules, optional subjects. We answer questions
        without requiring a call first.
      </p>

      <Honeypot registration={register("honeypot")} />

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field id="enquiry-name" label="Full name" required error={errors.name?.message}>
          <Input
            id="enquiry-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field id="enquiry-phone" label="Mobile number" required error={errors.phone?.message}>
          <Input
            id="enquiry-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Field id="enquiry-email" label="Email" required error={errors.email?.message}>
          <Input
            id="enquiry-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field id="enquiry-subject" label="Subject" error={errors.subject?.message}>
          <Input id="enquiry-subject" {...register("subject")} />
        </Field>

        <Field
          id="enquiry-message"
          label="Your message"
          required
          error={errors.message?.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="enquiry-message"
            rows={5}
            aria-invalid={Boolean(errors.message)}
            {...register("message")}
          />
        </Field>
      </div>

      {lead.errorMessage ? (
        <div className="mt-6">
          <FormError>{lead.errorMessage}</FormError>
        </div>
      ) : null}

      <Button type="submit" size="lg" className="mt-7" disabled={lead.isSubmitting}>
        {lead.isSubmitting ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
