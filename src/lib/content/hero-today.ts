import { unstable_cache } from "next/cache";

import type { Locale } from "@/i18n/config";
import { CTA, ROUTES } from "@/lib/constants/site";
import { getSiteCurrentAffairs } from "@/lib/content/site";
import { getPyqPapers, getStudyNotes } from "@/lib/sanity/queries";
import { mockTestService } from "@/services/mock-tests/mock-test.service";

export type TodayKind = "current-affairs" | "mock-test" | "pyq" | "notes" | "demo" | "guide";

export interface TodayItem {
  kind: TodayKind;
  /** Small line above the title: what this is. */
  kicker: string;
  title: string;
  /** Short facts after the title — a date, a length. */
  meta?: string;
  href: string;
}

/**
 * Open public papers, cached for five minutes. The homepage renders on every
 * request; without this each visit would be a Firestore query. A paper that
 * closes inside the window still shows here, and the mock page itself says it
 * has closed — so the cost of staleness is one extra click, never a wrong
 * result.
 */
const getOpenPapers = unstable_cache(() => mockTestService.listOpenPapers(), ["hero-open-papers"], {
  revalidate: 300,
});

const dayMonth = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });

/** Always-true fallbacks, so the strip keeps its three slots on an empty CMS. */
const FALLBACKS: TodayItem[] = [
  {
    kind: "demo",
    kicker: "Watch · free demo class",
    title: "Sit in on a live concept class",
    href: CTA.demo.href,
  },
  {
    kind: "guide",
    kicker: "Read · UPSC guide",
    title: "How the exam works, stage by stage",
    href: ROUTES.upscGuide,
  },
];

/**
 * The hero's "Today" strip: things a student can do right now, for free —
 * the latest current-affairs note, an open mock test, the previous-year paper
 * library. Only what exists is shown; empty slots fall back to the demo class
 * and the UPSC guide rather than to a made-up item.
 */
export async function getHeroToday(locale: Locale): Promise<TodayItem[]> {
  const [affairs, papers, pyqs, notes] = await Promise.all([
    getSiteCurrentAffairs(locale, 1),
    getOpenPapers().catch(() => []),
    getPyqPapers(),
    getStudyNotes(locale),
  ]);

  const items: TodayItem[] = [];

  const latest = affairs[0];
  if (latest) {
    items.push({
      kind: "current-affairs",
      kicker: "Read · current affairs",
      title: latest.title,
      meta: latest.publishedAt ? dayMonth(latest.publishedAt) : undefined,
      href: `${ROUTES.currentAffairs}/${latest.slug}`,
    });
  }

  const paper = papers[0];
  if (paper) {
    items.push({
      kind: "mock-test",
      kicker: "Attempt · mock test, open now",
      title: paper.title,
      meta: `${paper.questionCount} Qs · ${paper.durationMinutes} min`,
      href: ROUTES.mockTest,
    });
  }

  if (pyqs.length > 0) {
    items.push({
      kind: "pyq",
      kicker: "Solve · previous-year papers",
      title: `${pyqs.length} UPSC ${pyqs.length === 1 ? "paper" : "papers"}`,
      meta: "Sign in",
      href: "/dashboard/pyq",
    });
  }

  // Notes take the first empty slot, ahead of the generic fallbacks.
  if (notes.length > 0 && items.length < 3) {
    items.push({
      kind: "notes",
      kicker: "Download · notes",
      title: `${notes.length} subject-wise ${notes.length === 1 ? "note" : "notes"}`,
      meta: "PDF",
      href: ROUTES.notes,
    });
  }

  for (const fallback of FALLBACKS) {
    if (items.length >= 3) break;
    items.push(fallback);
  }

  return items.slice(0, 3);
}
