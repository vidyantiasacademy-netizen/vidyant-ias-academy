"use client";

import { useState } from "react";

import { track, type AnalyticsEvent } from "@/lib/analytics";
import { LeadSubmissionError, postLead, type LeadContext } from "@/lib/leads/client";
import type { LeadFormType } from "@/lib/validation/schemas";

type Status = "idle" | "submitting" | "success" | "error";

/** Shared submit/ status handling for every public lead form. */
export function useLeadForm(form: LeadFormType, successEvent: AnalyticsEvent) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(values: Record<string, unknown>, context: LeadContext = {}) {
    if (status === "submitting") return false;

    setStatus("submitting");
    setErrorMessage(null);

    try {
      await postLead(form, values, context);
      track(successEvent, { form, ...context });
      setStatus("success");
      return true;
    } catch (error) {
      const message =
        error instanceof LeadSubmissionError
          ? error.message
          : "Something went wrong. Please try again.";
      setErrorMessage(message);
      setStatus("error");
      return false;
    }
  }

  return {
    status,
    errorMessage,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
    submit,
    reset: () => {
      setStatus("idle");
      setErrorMessage(null);
    },
  };
}
