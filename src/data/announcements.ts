import type { Announcement } from "@/types";

/**
 * Noticeboard entries — batch starts, deadlines, schedule changes, results.
 *
 * Ships empty on purpose. An invented notice is worse than an empty board: it
 * is the kind of thing a visitor checks against reality on their first call.
 *
 * TODO(institute): add notices here and set the window. Template:
 *
 * {
 *   id: "foundation-jan-2026-open",
 *   title: "Foundation batch — January 2026 admissions open",
 *   body: "Interview-based admission. Seats are confirmed on a counselling call.",
 *   tone: "success",
 *   href: ROUTES.enrol,
 *   startsAt: "2026-01-02T09:00:00+05:30",
 *   endsAt: "2026-01-20T20:00:00+05:30",
 * }
 *
 * The same shape is defined as a Sanity `announcement` document, so this list
 * can later be replaced by `getActiveAnnouncements()` with no component change.
 */
export const announcements: Announcement[] = [];

/** Notices whose window covers `now`, newest first. */
export function activeAnnouncements(now = new Date()) {
  const current = now.getTime();
  return announcements
    .filter((item) => {
      const starts = new Date(item.startsAt).getTime();
      const ends = item.endsAt ? new Date(item.endsAt).getTime() : Infinity;
      return starts <= current && current <= ends;
    })
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

/** What the board carries once it is in use — shown while it is still empty. */
export const ANNOUNCEMENT_KINDS = [
  "Batch start dates and admission deadlines",
  "Test calendar changes and result declarations",
  "Holiday, timing and venue changes",
] as const;
