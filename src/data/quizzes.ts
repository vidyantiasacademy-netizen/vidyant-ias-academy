import type { Quiz, QuizStage } from "@/types";

/**
 * Practice quizzes — short, free, open to anyone preparing.
 *
 * Ships empty. No sample quiz is presented as a real one, and no quiz links
 * anywhere until `href` points at a live attempt page or the institute's own
 * form.
 *
 * TODO(institute): add quizzes here. Template:
 *
 * {
 *   id: "polity-weekly-01",
 *   slug: "polity-weekly-01",
 *   title: "Polity Weekly 01 — Constitutional Framework",
 *   stage: "prelims",
 *   subject: "Polity",
 *   description: "Ten questions on the Preamble, Articles 1–11 and the amendment process.",
 *   questionCount: 10,
 *   durationMinutes: 12,
 *   publishedAt: "2026-01-12",
 *   href: "https://forms.vidyantias.com/polity-weekly-01",
 *   status: "published",
 * }
 */
export const quizzes: Quiz[] = [];

export const QUIZ_STAGE_LABELS: Record<QuizStage, string> = {
  prelims: "Prelims",
  mains: "Mains",
  csat: "CSAT",
  "current-affairs": "Current Affairs",
};

export const publishedQuizzes = quizzes.filter((quiz) => quiz.status === "published");

/** Newest first — the board shows the most recent few. */
export function latestQuizzes(count = publishedQuizzes.length) {
  return [...publishedQuizzes]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, count);
}

export function quizzesForStage(stage: QuizStage) {
  return latestQuizzes().filter((quiz) => quiz.stage === stage);
}

export function quizBySlug(slug: string) {
  return quizzes.find((quiz) => quiz.slug === slug);
}

/** The planned cadence, shown while no quiz is published yet. */
export const QUIZ_PLAN = [
  {
    stage: "prelims" as const,
    title: "Prelims quiz, every week",
    note: "Ten questions on one syllabus area, with explanations for every option.",
  },
  {
    stage: "current-affairs" as const,
    title: "Current affairs quiz, every week",
    note: "Drawn from the week's developments, linked back to the static syllabus.",
  },
  {
    stage: "csat" as const,
    title: "CSAT set, every fortnight",
    note: "Comprehension, reasoning and basic numeracy at the paper's real difficulty.",
  },
];
