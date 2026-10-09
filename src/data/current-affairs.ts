/**
 * Analyses are Sanity `currentAffair` documents, read through
 * `src/lib/content/site.ts`. What stays here is page copy.
 */

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
