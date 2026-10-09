"use server";

import { z } from "zod";

import { action, authGuard } from "@/lib/auth/guards";
import { paymentService } from "@/services/payments/payment.service";

/**
 * The checkout's server surface. Any signed-in user may buy a course for
 * themselves: `createOrder` reads the amount from the course document and binds
 * the order to the caller's uid, so nothing the browser sends can change who
 * pays or how much.
 */

const id = z.string().min(1).max(128);

export const startCourseCheckoutAction = action(
  authGuard,
  z.object({ courseId: id, batchId: id.nullish() }),
  async (input) => paymentService.createOrder(input),
);

/**
 * Lets the success screen show straight away. Access itself is granted by the
 * webhook, so a student who closes the tab after paying is still enrolled.
 */
export const confirmCourseCheckoutAction = action(
  authGuard,
  z.object({
    razorpayOrderId: id,
    razorpayPaymentId: id,
    razorpaySignature: z.string().min(1).max(256),
  }),
  async (input) => paymentService.verifyPayment(input),
);
