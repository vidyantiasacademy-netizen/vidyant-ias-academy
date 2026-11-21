import { ROUTES } from "@/lib/constants/site";
import type { Announcement } from "@/types";

/**
 * One line of the notification strip above the header.
 *
 * Deliberately flat and serializable: the strip is rendered on the server and
 * rotated on the client, so an icon component cannot travel as a prop. The
 * client picks the icon from `tone`.
 */
export interface StripNotice {
  id: string;
  tone: Announcement["tone"];
  /** Six to ten words. This line is read on a phone, in a hurry, in sunlight. */
  text: string;
  /** An in-app route, or omitted when the line is informational only. */
  href?: string;
  /** Two or three words. Defaults to "Details" when a `href` is set. */
  linkLabel?: string;
}

/** Cap on what the strip rotates through — past this, nothing comes back round. */
const MAX_NOTICES = 6;

/**
 * The standing lines, shown after any dated notice from the Studio.
 *
 * The batch dates below were given by the institute (2026-11-21). House rules
 * still apply: no selection counts, no student numbers, no discounts, and
 * every `href` is a real route.
 *
 * TODO(institute): edit as batches start. The strip adapts to any count, and
 * hides itself when the list is empty.
 */
const STANDING_STRIP_NOTICES: StripNotice[] = [
  {
    id: "prelims-test-series-2027",
    tone: "success",
    text: "UPSC Prelims Test Series 2027 — Starting 3 January 2027",
    href: `${ROUTES.courses}/upsc-prelims-test-series`,
    linkLabel: "View details",
  },
  {
    id: "current-affairs-revision-2027",
    tone: "success",
    text: "Current Affairs Revision Classes for Prelims 2027 — Starting 20 December 2026",
    href: `${ROUTES.courses}/current-affairs-prelims-2027`,
    linkLabel: "View details",
  },
];

/**
 * What the strip shows right now: dated notices first, newest at the front,
 * then the standing lines.
 *
 * `active` is `getSiteAnnouncements()` — already windowed to now by the Sanity
 * query, on the server, so the markup matches on hydration.
 */
export function stripNotices(active: Announcement[]): StripNotice[] {
  const dated: StripNotice[] = active.map((notice) => ({
    id: `announcement-${notice.id}`,
    tone: notice.tone,
    text: notice.title,
    href: notice.href ?? undefined,
    linkLabel: notice.href ? "Read the notice" : undefined,
  }));

  return [...dated, ...STANDING_STRIP_NOTICES].slice(0, MAX_NOTICES);
}
