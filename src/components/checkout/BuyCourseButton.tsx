"use client";

import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button, ButtonLink, type ButtonVariants } from "@/components/ui/Button";
import { localizeHref } from "@/i18n/config";
import { useLocale } from "@/i18n/I18nProvider";
import { track } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { BRAND, ROUTES } from "@/lib/constants/site";
import { confirmCourseCheckoutAction, startCourseCheckoutAction } from "@/lib/payments/actions";
import { cn } from "@/lib/utils/cn";
import type { Course } from "@/types";

/**
 * "Buy now" for a priced programme: Razorpay Checkout in a modal, no page
 * change. Signed-out visitors are sent to sign in and land back where they
 * were. When the course cannot be bought online (no fixed price, or payments
 * not configured) this renders the enrolment-form link instead, so the button
 * never leads to a dead end.
 */

const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", handler: () => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Razorpay Checkout failed to load"));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

type Status = "idle" | "working" | "paid" | "error";

interface BuyCourseButtonProps extends ButtonVariants {
  course: Pick<Course, "id" | "slug" | "title" | "buyOnline">;
  /** Where the click came from, for analytics. */
  location: string;
  children?: ReactNode;
  className?: string;
}

export function BuyCourseButton({
  course,
  location,
  children = "Buy now",
  className,
  ...variants
}: BuyCourseButtonProps) {
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (!course.buyOnline) {
    return (
      <ButtonLink
        href={`${ROUTES.enrol}?course=${encodeURIComponent(course.slug)}#enrolment-form`}
        onClick={() => track(ANALYTICS_EVENTS.enrolClick, { course: course.id, location })}
        className={className}
        {...variants}
      >
        Enrol now
      </ButtonLink>
    );
  }

  if (status === "paid") {
    return (
      <ButtonLink href="/dashboard" className={className} {...variants}>
        Payment received — open dashboard
      </ButtonLink>
    );
  }

  async function buy() {
    setStatus("working");
    setMessage(null);
    track(ANALYTICS_EVENTS.checkoutStart, { course: course.id, location });

    const order = await startCourseCheckoutAction({ courseId: course.id });

    if (!order.ok) {
      if (order.error === "AUTH_REQUIRED") {
        const back = `${window.location.pathname}${window.location.search}`;
        window.location.assign(
          localizeHref(`${ROUTES.login}?next=${encodeURIComponent(back)}`, locale),
        );
        return;
      }

      setStatus("error");
      setMessage(order.message);
      return;
    }

    try {
      await loadCheckout();
    } catch {
      setStatus("error");
      setMessage("The payment window could not load. Check your connection and try again.");
      return;
    }

    const checkout = new window.Razorpay!({
      key: order.data.keyId,
      order_id: order.data.razorpayOrderId,
      amount: order.data.amountInPaise,
      currency: order.data.currency,
      name: BRAND.name,
      description: course.title,
      theme: { color: "#041840" },
      handler: async (response: RazorpaySuccess) => {
        const confirmed = await confirmCourseCheckoutAction({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });

        if (confirmed.ok) {
          track(ANALYTICS_EVENTS.checkoutSuccess, { course: course.id, location });
          setStatus("paid");
        } else {
          setStatus("error");
          setMessage(
            "We could not confirm the payment yet. If money was deducted, your enrolment activates automatically within a few minutes.",
          );
        }
      },
      modal: { ondismiss: () => setStatus("idle") },
    });

    checkout.on("payment.failed", () => {
      setStatus("error");
      setMessage("The payment did not go through. No money was taken — please try again.");
    });

    checkout.open();
  }

  return (
    <span className={cn("inline-flex flex-col gap-2", variants.fullWidth && "flex w-full")}>
      <Button
        onClick={buy}
        disabled={status === "working"}
        aria-busy={status === "working"}
        className={className}
        {...variants}
      >
        {status === "working" ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
        {children}
      </Button>
      {message ? (
        <span role="alert" className="text-small text-chilli-700">
          {message}
        </span>
      ) : null}
    </span>
  );
}
