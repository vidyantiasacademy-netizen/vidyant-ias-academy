import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAtLeast } from "@/lib/auth/roles";
import { requireAuthPage } from "@/lib/auth/server";

/**
 * The exam shell — deliberately bare.
 *
 * No portal header, no navigation tabs, no back link, no sign-out button. Every
 * one of those is a way out of the paper, and a link that leaves a live sitting
 * mid-question is a support ticket at best and a lost attempt at worst. The only
 * controls on this screen belong to the paper.
 *
 * The guard is the same one the portal uses: a layout runs before every route
 * beneath it, so a route added here cannot ship unauthenticated. The services
 * check again anyway, because the Server Actions under `lib/exam/actions.ts` are
 * reachable without this layout ever rendering.
 */
export const metadata: Metadata = {
  title: "Examination",
  robots: { index: false, follow: false },
};

export default async function ExamLayout({ children }: LayoutProps<"/">) {
  const session = await requireAuthPage("/dashboard");

  // Staff do not sit papers. They have the question bank, which makes an
  // "attempt" by a faculty account meaningless data in the results table.
  if (isAtLeast(session.role, "COUNSELLOR")) redirect("/admin");

  return <>{children}</>;
}
