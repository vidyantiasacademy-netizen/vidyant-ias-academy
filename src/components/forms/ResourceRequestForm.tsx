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
  LEAD_FORMS,
  emailField,
  honeypotField,
  nameField,
  phoneField,
} from "@/lib/validation/schemas";
import type { Resource } from "@/types";

const schema = z.object({
  name: nameField,
  phone: phoneField,
  email: emailField,
  resource: z.string().min(1, "Choose a resource."),
  honeypot: honeypotField,
});

type Values = z.input<typeof schema>;

export function ResourceRequestForm({ resources }: { resources: Resource[] }) {
  const lead = useLeadForm(LEAD_FORMS.resource, ANALYTICS_EVENTS.resourceDownload);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });

  if (lead.isSuccess) {
    return (
      <FormSuccess
        title="On its way."
        description="We will email the material shortly. If it does not arrive, check your spam folder or call the centre."
      />
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await lead.submit(values, { source: "resources-page" });
      })}
      className="rounded-lg border border-line bg-white p-6 sm:p-8"
    >
      <h2 className="text-h3 font-semibold">Request a resource</h2>
      <p className="mt-3 text-body text-ink-secondary">
        Some material is sent by email while we finish preparing the download files. Ask for
        it here — no call is required unless you want one.
      </p>

      <Honeypot registration={register("honeypot")} />

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field id="resource-name" label="Full name" required error={errors.name?.message}>
          <Input
            id="resource-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field id="resource-phone" label="Mobile number" required error={errors.phone?.message}>
          <Input
            id="resource-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Field id="resource-email" label="Email" required error={errors.email?.message}>
          <Input
            id="resource-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field id="resource-item" label="Resource" required error={errors.resource?.message}>
          <Select
            id="resource-item"
            defaultValue=""
            aria-invalid={Boolean(errors.resource)}
            {...register("resource")}
          >
            <option value="" disabled>
              Select
            </option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.title}>
                {resource.title}
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

      <Button type="submit" size="lg" className="mt-7" disabled={lead.isSubmitting}>
        {lead.isSubmitting ? "Sending…" : "Send it to me"}
      </Button>
    </form>
  );
}
