import type { CurrentAffair } from "@/types";

/**
 * Current affairs analyses. Empty until the daily desk starts publishing —
 * placeholder "news" is never shown, because dated content that is not real
 * misleads aspirants.
 *
 * TODO(content): publish analyses, or connect a CMS to this data layer.
 */
export const currentAffairs: CurrentAffair[] = [];

export const publishedCurrentAffairs = currentAffairs.filter(
  (item) => item.status === "published",
);

/** What the current affairs desk covers — used for the preview section. */
export const CURRENT_AFFAIRS_COVERAGE = [
  {
    subject: "Polity & Governance",
    note: "Bills, judgments and institutional developments mapped to GS-II.",
  },
  {
    subject: "Economy",
    note: "Policy decisions, reports and indices with the data you can quote.",
  },
  {
    subject: "Environment",
    note: "Conventions, species and climate policy linked to the static syllabus.",
  },
  {
    subject: "International Relations",
    note: "Agreements and groupings with the background a Mains answer needs.",
  },
] as const;

export function currentAffairBySlug(slug: string) {
  return currentAffairs.find((item) => item.slug === slug);
}
