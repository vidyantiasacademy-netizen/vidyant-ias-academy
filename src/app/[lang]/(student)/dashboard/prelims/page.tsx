import type { Metadata } from "next";

import { TestSeriesBoard } from "@/components/portal/TestSeriesBoard";
import { BRAND } from "@/lib/constants/site";
import type { TestKind } from "@/types/db";

/**
 * Prelims papers across every active enrollment.
 *
 * CSAT and sectional papers belong here too: a student preparing for Prelims
 * sits them in the same cycle, and splitting them into a third tab would hide
 * half the calendar.
 */
export const metadata: Metadata = {
  title: `Prelims Test Series | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

const PRELIMS_KINDS: readonly TestKind[] = ["prelims-mcq", "csat", "sectional"];

export default function PrelimsPage() {
  return (
    <>
      <h1 className="text-h2 font-semibold">Prelims Test Series</h1>
      <p className="mt-2 text-body text-ink-secondary">
        Full-length papers, CSAT and sectional tests from your programmes.
      </p>

      <div className="mt-8">
        <TestSeriesBoard
          kinds={PRELIMS_KINDS}
          emptyTitle="No Prelims papers yet"
          emptyDescription="Papers appear here as soon as a Prelims test series is part of your enrollment and the schedule is out."
        />
      </div>
    </>
  );
}
