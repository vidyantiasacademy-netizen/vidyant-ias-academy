import "server-only";

import type { PublishStatus, TestKind } from "@/types/db";

import { requireRolePage } from "../page-guards";

export { paperLockReason } from "@/lib/exam/authoring";
export { orNotFound } from "../page-guards";

/** The test authoring pages are faculty and above. */
export function requireFacultyPage(path: string) {
  return requireRolePage(path, "FACULTY");
}

export const KIND_LABELS: Record<TestKind, string> = {
  "prelims-mcq": "Prelims GS",
  csat: "CSAT",
  sectional: "Sectional",
  "mains-descriptive": "Mains",
};

export const STATUS_TONE: Record<PublishStatus, "success" | "neutral"> = {
  published: "success",
  draft: "neutral",
  archived: "neutral",
};
