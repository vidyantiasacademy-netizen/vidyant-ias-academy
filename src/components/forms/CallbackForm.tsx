"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Clock, LayoutGrid, Mail, Phone, UserRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
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
  /** Preselects the topic — the parents page opens on "A parent's questions". */
  defaultTopic?: (typeof CALLBACK_TOPICS)[number];
  /** `panel`: the homepage's navy card — icon-led inputs, kesar submit. */
  variant?: "default" | "panel";
}

/** Leads a control with an icon. Only the panel variant uses it. */
function Lead({ icon: Icon, on, children }: { icon: LucideIcon; on: boolean; children: ReactNode }) {
  if (!on) return children;
  return (
    <div className="relative">
      <Icon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-indigo"
        strokeWidth={1.75}
      />
      {children}
    </div>
  );
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
  defaultTopic,
  variant = "default",
}: CallbackFormProps) {
  const panel = variant === "panel";
  const tone = panel ? "onDark" : "default";
  // Panel inputs: white pills on navy, padded for the leading icon.
  const control = panel ? "rounded-xl border-white pl-11 hover:border-kesar focus:border-kesar" : undefined;
  const lead = useLeadForm(LEAD_FORMS.callback, ANALYTICS_EVENTS.callbackSubmit);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: defaultTopic ? { topic: defaultTopic } : undefined,
  });

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
        "scroll-mt-28",
        panel
          ? "focus-invert relative isolate overflow-hidden rounded-[1.5rem] bg-indigo bg-linear-to-br from-indigo-950 via-indigo to-indigo-700 p-6 text-white shadow-soft sm:p-8"
          : "rounded-2xl border border-line border-t-4 border-t-indigo bg-white p-6 sm:p-8",
        className,
      )}
    >
      {panel ? (
        <svg
          aria-hidden
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          className="pointer-events-none absolute right-0 bottom-0 -z-10 h-40 w-3/4 text-white"
        >
          <path d="M0 200 C 120 170, 200 120, 400 40 L 400 200Z" fill="currentColor" opacity="0.05" />
          <path d="M120 200 C 220 170, 300 140, 400 100 L 400 200Z" fill="currentColor" opacity="0.06" />
        </svg>
      ) : null}
      <div className={cn(panel && "flex items-start gap-4")}>
        {panel ? (
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-kesar text-indigo-900"
          >
            <Phone className="size-7" strokeWidth={2} />
          </span>
        ) : null}
        <div>
          <Heading className={cn("font-bold tracking-tight", panel ? "font-display text-h3 text-white" : "text-h3")}>
            Request a callback
          </Heading>
          <p className={cn("text-body", panel ? "mt-1.5 text-white/85" : "mt-3 text-ink-secondary")}>
            Leave a number and a time that suits you. No email needed, and no obligation to
            enrol.
          </p>
        </div>
      </div>

      <Honeypot registration={register("honeypot")} />

      <div className={cn("grid gap-5 sm:grid-cols-2", panel ? "mt-6 gap-y-4" : "mt-7")}>
        <Field id="callback-name" label="Full name" required error={errors.name?.message} tone={tone}>
          <Lead icon={UserRound} on={panel}>
            <Input
              id="callback-name"
              autoComplete="name"
              placeholder={panel ? "Enter your name" : undefined}
              className={control}
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </Lead>
        </Field>

        <Field
          id="callback-phone"
          label="Mobile number"
          required
          error={errors.phone?.message}
          tone={tone}
        >
          <Lead icon={Phone} on={panel}>
            <Input
              id="callback-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={panel ? "Enter 10-digit number" : undefined}
              className={control}
              aria-invalid={Boolean(errors.phone)}
              {...register("phone")}
            />
          </Lead>
        </Field>

        <Field
          id="callback-topic"
          label="What is the call about"
          required
          error={errors.topic?.message}
          tone={tone}
        >
          <Lead icon={LayoutGrid} on={panel}>
          <Select
            id="callback-topic"
            defaultValue={defaultTopic ?? ""}
            className={control}
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
          </Lead>
        </Field>

        <Field
          id="callback-time"
          label="Preferred time"
          required
          error={errors.preferredTime?.message}
          tone={tone}
        >
          <Lead icon={Clock} on={panel}>
          <Select
            id="callback-time"
            defaultValue=""
            className={control}
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
          </Lead>
        </Field>

        <Field
          id="callback-email"
          label="Email"
          error={errors.email?.message}
          className="sm:col-span-2"
          tone={tone}
        >
          <Lead icon={Mail} on={panel}>
            <Input
              id="callback-email"
              type="email"
              autoComplete="email"
              placeholder={panel ? "Enter your email" : undefined}
              className={control}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </Lead>
        </Field>
      </div>

      {lead.errorMessage ? (
        <div className="mt-6">
          <FormError>{lead.errorMessage}</FormError>
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        variant={panel ? "kesar" : "primary"}
        className={cn("mt-7", panel && "rounded-xl hover:bg-white hover:text-indigo")}
        disabled={lead.isSubmitting}
      >
        {panel ? <Phone aria-hidden className="size-5" /> : null}
        {lead.isSubmitting ? "Sending…" : "Request a callback"}
        {panel ? <ArrowRight aria-hidden className="size-5" /> : null}
      </Button>
    </form>
  );
}
