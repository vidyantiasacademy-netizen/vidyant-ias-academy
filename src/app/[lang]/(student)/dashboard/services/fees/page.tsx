import type { Metadata } from "next";
import { CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireAuth } from "@/lib/auth/server";
import { BRAND } from "@/lib/constants/site";
import { paymentService } from "@/services/payments/payment.service";
import { paiseToRupees, type PaymentStatus } from "@/types/db";

/** Fee history. Receipts are the payment records themselves — no PDF yet. */
export const metadata: Metadata = {
  title: `Fees | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

const STATUS_TONES: Record<PaymentStatus, "success" | "kesar" | "neutral"> = {
  created: "neutral",
  authorized: "kesar",
  captured: "success",
  failed: "neutral",
  refunded: "neutral",
};

/** Razorpay's vocabulary, in the words a student uses. */
const STATUS_LABELS: Record<PaymentStatus, string> = {
  created: "Not paid",
  authorized: "Processing",
  captured: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default async function FeesPage() {
  const user = await requireAuth();
  const payments = await paymentService.listForStudent(user.uid);

  return (
    <>
      <h1 className="text-h2 font-bold">Fees</h1>
      <p className="mt-2 text-body text-ink-secondary">
        Every payment recorded against your account.
      </p>

      {payments.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<CreditCard aria-hidden className="size-5" />}
            title="No payments recorded"
            description="Fees paid at the centre are entered by the front desk and appear here once receipted."
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {payments.map((payment) => (
            <li key={payment.id}>
              <Card tone="white" padding="sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-body font-semibold">
                      {rupees.format(paiseToRupees(payment.amount.amountInPaise))}
                    </p>
                    <p className="mt-1 text-small text-ink-secondary">
                      {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <Badge tone={STATUS_TONES[payment.status]}>{STATUS_LABELS[payment.status]}</Badge>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
