import type { Result } from "@/types";

/**
 * NO RESULTS ARE PUBLISHED YET.
 *
 * vidyantIAS publishes only outcomes it can verify with the candidate's consent
 * and roll number on record. Selection counts are never estimated or implied.
 *
 * To publish: add entries with `verified: true` and `status: "published"`.
 */
const results: Result[] = [];

export const publishedResults = results.filter(
  (item) => item.status === "published" && item.verified,
);

export const RESULT_STAGES = [
  { id: "prelims", label: "Prelims Qualified" },
  { id: "mains", label: "Mains Qualified" },
  { id: "interview", label: "Interview Qualified" },
  { id: "final", label: "Final Selections" },
] as const;
