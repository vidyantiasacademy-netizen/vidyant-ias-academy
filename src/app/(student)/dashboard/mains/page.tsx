import type { Metadata } from "next";

import { TestSeriesBoard } from "@/components/portal/TestSeriesBoard";
import { BRAND } from "@/lib/constants/site";
import type { TestKind } from "@/types/db";

/** Descriptive papers. Evaluated copies come back under Services → My Copies. */
export const metadata: Metadata = {
  title: `Mains Test Series | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

const MAINS_KINDS: readonly TestKind[] = ["mains-descriptive"];

export default function MainsPage() {
  return (
    <>
      <h1 className="text-h2 font-semibold">Mains Test Series</h1>
      <p className="mt-2 text-body text-ink-secondary">
        Descriptive papers and the evaluation that follows each one.
      </p>

      <div className="mt-8">
        <TestSeriesBoard
          kinds={MAINS_KINDS}
          emptyTitle="No Mains papers yet"
          emptyDescription="Papers appear here as soon as a Mains test series is part of your enrollment and the schedule is out."
        />
      </div>
    </>
  );
}
