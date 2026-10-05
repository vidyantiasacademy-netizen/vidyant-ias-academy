import type { Entity, IsoDateTime, Money, Uid } from "./common";

export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

/**
 * `payments/{paymentId}` — one Razorpay order and its outcome.
 *
 * Status transitions are written by the webhook route handler only, after HMAC
 * verification. Neither students nor admins may write this collection from the
 * client: a student who could set `captured` would enroll for free, which is why
 * the rules give the whole collection `allow write: if false`.
 */
export interface PaymentDoc {
  studentUid: Uid;
  courseId: string;
  batchId: string | null;
  amount: Money;
  status: PaymentStatus;
  /** Razorpay order id (`order_...`), created server-side. */
  razorpayOrderId: string;
  /** Razorpay payment id (`pay_...`), present once the attempt succeeds. */
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  method: string | null;
  /** Razorpay's own failure reason, kept for reconciliation, never shown raw. */
  failureReason: string | null;
  /** Enrollment this payment unlocked, written after capture. */
  enrollmentId: string | null;
  capturedAt: IsoDateTime | null;
  refundedAt: IsoDateTime | null;
  /** Every webhook event id already applied, so retries stay idempotent. */
  processedEventIds: string[];
}

export type Payment = Entity<PaymentDoc>;
