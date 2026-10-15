import type { Metadata } from "next";

import { PyqLibrary } from "@/components/portal/pyq/PyqLibrary";
import { BRAND } from "@/lib/constants/site";
import { getPyqPapers } from "@/lib/sanity/queries";

/**
 * UPSC previous-year papers, published from Sanity (`pyqPaper`).
 *
 * The same documents the student app reads. Cached under the `pyqPaper` tag,
 * so publishing a paper in the Studio shows it here once the webhook fires.
 */
export const metadata: Metadata = {
  title: `PYQ Papers | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default async function PyqPage() {
  const papers = await getPyqPapers();

  return (
    <>
      <h1 className="text-h2 font-bold">Previous Year Papers</h1>
      <p className="mt-2 text-body text-ink-secondary">
        UPSC Prelims and Mains question papers by category. Pick a paper and open any year.
      </p>

      <div className="mt-8">
        <PyqLibrary papers={papers} />
      </div>
    </>
  );
}
