import "server-only";

import type { AnswerSubmissionStatus } from "@/types/db";

import { requireRolePage } from "../page-guards";

export { orNotFound } from "../page-guards";

/** Evaluating copies is faculty work, the same rank that authors test papers. */
export function requireFacultyPage(path: string) {
  return requireRolePage(path, "FACULTY");
}

export const COPY_STATUS_TONE: Record<AnswerSubmissionStatus, "neutral" | "kesar" | "indigo" | "success"> = {
  draft: "neutral",
  submitted: "kesar",
  "in-review": "indigo",
  evaluated: "success",
};

/** The staff wording, where the student sees "Not submitted". */
export const STAFF_STATUS_LABELS: Record<AnswerSubmissionStatus, string> = {
  draft: "Writing",
  submitted: "Awaiting evaluation",
  "in-review": "Being evaluated",
  evaluated: "Evaluated",
};
