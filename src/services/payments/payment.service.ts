import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { requireAuth, requireSelfOrRole } from "@/lib/auth/server";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  FieldValue,
  auditOnCreate,
  auditOnUpdate,
  collection,
  requireEntity,
  toEntities,
  toEntity,
} from "@/lib/firebase/firestore";
import type { Payment, PaymentDoc, PaymentStatus } from "@/types/db";

import { courseService } from "../courses/course.service";
import { grantFromPayment } from "../enrollments/enrollment.service";
import { notify } from "../notifications/notification.service";

/**
 * Razorpay payments.
 *
 * The invariant: nothing the browser says about a payment is believed. The
 * browser gets an order id and a checkout handler; the server decides whether
 * money arrived, by HMAC-verifying either the checkout signature or (better)
 * the webhook. An enrollment is granted from `handleWebhook` — never from the
 * success callback alone, because a closed laptop between payment and callback
 * would otherwise lose the student their course.
 *
 * Razorpay has no SDK dependency here on purpose: two REST calls and two HMACs
 * are less surface than a client library, and keep the secret in exactly one
 * module.
 */

const RAZORPAY_API = "https://api.razorpay.com/v1";

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new AppError(ERROR_CODES.CONFIG_ERROR, {
      message: "Online payment is not available yet.",
      cause: new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set"),
    });
  }

  return { keyId, keySecret };
}

/** Constant-time compare. `===` on a signature leaks it one byte at a time. */
function signaturesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");

  return a.length === b.length && timingSafeEqual(a, b);
}

export interface CreateOrderInput {
  courseId: string;
  batchId?: string | null;
}

export interface CreateOrderResult {
  paymentId: string;
  razorpayOrderId: string;
  amountInPaise: number;
  currency: "INR";
  /** Public key, safe to hand to Razorpay Checkout in the browser. */
  keyId: string;
}

/**
 * Creates a Razorpay order for the caller.
 *
 * The amount is read from the course document, never from the request — a
 * client-supplied amount is a ₹1 enrollment.
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const user = await requireAuth();
  const { keyId, keySecret } = credentials();

  const course = await courseService.getById(input.courseId);

  if (!course) throw new AppError(ERROR_CODES.NOT_FOUND, { message: "Course not found." });

  if (!course.price) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: "This programme's fee is confirmed on a counselling call.",
    });
  }

  const ref = collection(COLLECTIONS.payments).doc();

  const response = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: course.price.amountInPaise,
      currency: course.price.currency,
      // Our own document id, echoed back on every webhook event.
      receipt: ref.id,
      notes: {
        paymentDocId: ref.id,
        studentUid: user.uid,
        courseId: input.courseId,
        batchId: input.batchId ?? "",
      },
    }),
  });

  if (!response.ok) {
    console.error("[razorpay] order creation failed", response.status, await response.text());
    throw new AppError(ERROR_CODES.PAYMENT_FAILED);
  }

  const order = (await response.json()) as { id: string };

  const doc: PaymentDoc = {
    studentUid: user.uid,
    courseId: input.courseId,
    batchId: input.batchId ?? null,
    amount: course.price,
    status: "created",
    razorpayOrderId: order.id,
    razorpayPaymentId: null,
    razorpaySignature: null,
    method: null,
    failureReason: null,
    enrollmentId: null,
    capturedAt: null,
    refundedAt: null,
    processedEventIds: [],
  };

  await ref.set({ ...doc, ...auditOnCreate(user.uid) });

  return {
    paymentId: ref.id,
    razorpayOrderId: order.id,
    amountInPaise: course.price.amountInPaise,
    currency: course.price.currency,
    keyId,
  };
}

/**
 * Verifies the signature Razorpay Checkout hands the browser.
 *
 * This confirms the payment really happened, and is what lets the UI show a
 * success screen immediately. It does not grant access — the webhook does, so
 * that a student who closes the tab is still enrolled.
 */
export async function verifyPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ verified: boolean }> {
  const user = await requireAuth();
  const { keySecret } = credentials();

  const expected = createHmac("sha256", keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  const verified = signaturesMatch(expected, input.razorpaySignature);

  const snapshot = await collection(COLLECTIONS.payments)
    .where("razorpayOrderId", "==", input.razorpayOrderId)
    .limit(1)
    .get();

  if (snapshot.empty) throw new AppError(ERROR_CODES.NOT_FOUND);

  const payment = toEntity<Payment>(snapshot.docs[0])!;

  if (payment.studentUid !== user.uid) throw new AppError(ERROR_CODES.FORBIDDEN);

  await snapshot.docs[0].ref.update({
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
    status: verified ? ("authorized" satisfies PaymentStatus) : "failed",
    failureReason: verified ? null : "signature_mismatch",
    ...auditOnUpdate(user.uid),
  });

  if (!verified) throw new AppError(ERROR_CODES.PAYMENT_FAILED);

  return { verified };
}

/** HMAC-verifies a webhook body. Must be the raw text, not re-serialised JSON. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new AppError(ERROR_CODES.CONFIG_ERROR, {
      cause: new Error("RAZORPAY_WEBHOOK_SECRET is not set"),
    });
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return signaturesMatch(expected, signature);
}

interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        method?: string;
        error_description?: string;
        notes?: Record<string, string>;
      };
    };
  };
}

/**
 * Applies a verified webhook event.
 *
 * Idempotent by event id: Razorpay retries, and a retried `payment.captured`
 * must not grant a second enrollment or double a counter. There is no session
 * on a webhook request, so this function and `grantFromPayment` are the only
 * writers without a role check — the route handler's signature check is their
 * authorisation.
 */
export async function handleWebhook(
  event: RazorpayWebhookEvent,
  eventId: string,
): Promise<{ applied: boolean }> {
  const entity = event.payload.payment?.entity;
  if (!entity) return { applied: false };

  const snapshot = await collection(COLLECTIONS.payments)
    .where("razorpayOrderId", "==", entity.order_id)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.error("[razorpay] webhook for unknown order", entity.order_id);
    return { applied: false };
  }

  const ref = snapshot.docs[0].ref;
  const payment = requireEntity<Payment>(snapshot.docs[0], "payment");

  if (payment.processedEventIds.includes(eventId)) return { applied: false };

  if (event.event === "payment.captured") {
    const enrollment = await grantFromPayment({
      studentUid: payment.studentUid,
      courseId: payment.courseId,
      batchId: payment.batchId,
      startsAt: new Date().toISOString().slice(0, 10),
      paymentId: payment.id,
    });

    await ref.update({
      status: "captured" satisfies PaymentStatus,
      razorpayPaymentId: entity.id,
      method: entity.method ?? null,
      enrollmentId: enrollment.id,
      capturedAt: FieldValue.serverTimestamp(),
      processedEventIds: FieldValue.arrayUnion(eventId),
      ...auditOnUpdate("system"),
    });

    await notify({
      userUid: payment.studentUid,
      kind: "payment",
      title: "Payment received",
      body: "Your enrollment is active. Your classes and material are now available.",
      href: "/dashboard",
    });

    return { applied: true };
  }

  if (event.event === "payment.failed") {
    await ref.update({
      status: "failed" satisfies PaymentStatus,
      razorpayPaymentId: entity.id,
      failureReason: entity.error_description ?? "unknown",
      processedEventIds: FieldValue.arrayUnion(eventId),
      ...auditOnUpdate("system"),
    });

    return { applied: true };
  }

  if (event.event === "refund.processed") {
    await ref.update({
      status: "refunded" satisfies PaymentStatus,
      refundedAt: FieldValue.serverTimestamp(),
      processedEventIds: FieldValue.arrayUnion(eventId),
      ...auditOnUpdate("system"),
    });

    return { applied: true };
  }

  return { applied: false };
}

export async function getPaymentStatus(paymentId: string): Promise<Payment> {
  const payment = requireEntity<Payment>(
    await collection(COLLECTIONS.payments).doc(paymentId).get(),
    "payment",
  );

  await requireSelfOrRole(payment.studentUid, "COUNSELLOR");

  return payment;
}

export async function listForStudent(studentUid: string): Promise<Payment[]> {
  await requireSelfOrRole(studentUid, "COUNSELLOR");

  const snapshot = await collection(COLLECTIONS.payments)
    .where("studentUid", "==", studentUid)
    .orderBy("createdAt", "desc")
    .get();

  return toEntities<PaymentDoc>(snapshot.docs) as Payment[];
}

export const paymentService = {
  createOrder,
  verifyPayment,
  verifyWebhookSignature,
  handleWebhook,
  getPaymentStatus,
  listForStudent,
};
