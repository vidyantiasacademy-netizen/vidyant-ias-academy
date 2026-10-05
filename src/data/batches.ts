import type { Batch } from "@/types";

/**
 * Admission calendar — the batches a visitor can actually join.
 *
 * TODO(institute): add each confirmed batch and set `status: "published"`.
 * Until a date is confirmed the homepage shows a "calendar being finalised"
 * state with a callback request, never an invented start date. Template:
 *
 * {
 *   id: "foundation-2026-jan",
 *   slug: "foundation-january-2026",
 *   courseId: "foundation-program",
 *   title: "Foundation Batch — January 2026",
 *   startDate: "2026-01-12",
 *   schedule: "Mon–Sat, 9:00 am – 12:00 pm",
 *   mode: "Classroom (Pune)",
 *   location: "vidyantIAS, Pune",
 *   duration: "Full cycle to CSE 2027",
 *   seatsNote: "Limited seats — interview-based admission",
 *   fee: "Shared during counselling, including instalment options",
 *   highlight: "Filling fast",
 *   status: "published",
 * }
 */
export const batches: Batch[] = [];

export const publishedBatches = batches.filter((batch) => batch.status === "published");

/** Batches that have not started yet, soonest first. */
export function upcomingBatches(now = new Date()) {
  const today = new Date(now.toDateString());
  return publishedBatches
    .filter((batch) => new Date(batch.startDate) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function batchesForCourse(courseId: string, now = new Date()) {
  return upcomingBatches(now).filter((batch) => batch.courseId === courseId);
}

export function batchBySlug(slug: string) {
  return batches.find((batch) => batch.slug === slug);
}
