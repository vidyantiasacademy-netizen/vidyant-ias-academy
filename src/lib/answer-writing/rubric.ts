import type { RubricKey, RubricScores } from "@/types/db";

/**
 * The criteria a Mains answer is assessed on, beyond its marks.
 *
 * Marks say how well a copy did; the rubric says why, in the same five terms on
 * every copy, so a student can see which habit is costing them across papers
 * rather than reading a fresh paragraph of remarks each time. They are the
 * parameters UPSC evaluators are understood to reward, phrased for a student.
 *
 * Shared by the evaluation form, the student's report and the cohort summary.
 * Changing a key orphans every score already stored under it — add, don't
 * rename.
 */
export const ANSWER_RUBRIC: readonly {
  key: RubricKey;
  label: string;
  description: string;
}[] = [
  {
    key: "demand",
    label: "Demand of the question",
    description:
      "Answers what was asked — every part, and the directive (discuss, examine, critically analyse).",
  },
  {
    key: "content",
    label: "Content and depth",
    description:
      "Accurate facts, examples, data, reports, judgments and constitutional provisions.",
  },
  {
    key: "structure",
    label: "Structure",
    description:
      "A crisp introduction, an organised body, and a balanced, forward-looking conclusion.",
  },
  {
    key: "presentation",
    label: "Presentation",
    description:
      "Legible writing, headings, underlining, and diagrams or flowcharts where they help.",
  },
  {
    key: "language",
    label: "Language and word limit",
    description: "Concise, precise language that keeps to the word limit.",
  },
];

export const RUBRIC_MAX = 5;

/** What each point on the scale means, so two evaluators mean the same 3. */
export const RUBRIC_SCALE: Record<number, string> = {
  1: "Needs significant work",
  2: "Below expectations",
  3: "Meets expectations",
  4: "Good",
  5: "Excellent",
};

export function emptyRubric(): RubricScores {
  return { demand: null, content: null, structure: null, presentation: null, language: null };
}
