import { CTA, EXAM_CYCLE, ROUTES } from "@/lib/constants/site";
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
 * The standing lines, shown when there is no dated notice to lead with.
 *
 * House rules, same as the hero banners: every line must be verifiable today.
 * No selection counts, no student numbers, no discounts, no invented dates or
 * deadlines. Each line repeats a claim the site already makes elsewhere, and
 * every `href` is a real route.
 *
 * TODO(institute): edit as campaigns change. The strip adapts to any count,
 * and hides itself when the list is empty.
 */
const STANDING_STRIP_NOTICES: StripNotice[] = [
  {
    id: "admissions",
    tone: "success",
    text: `${EXAM_CYCLE.admissionNote} for ${EXAM_CYCLE.label} — Foundation to Mains`,
    href: CTA.enrol.href,
    linkLabel: "Enroll now",
  },
  {
    id: "demo",
    tone: "info",
    text: "Sit in on a live concept class, free of charge",
    href: CTA.demo.href,
    linkLabel: "Book a seat",
  },
  {
    id: "counselling",
    tone: "info",
    text: "Free one-to-one counselling with the academic team",
    href: CTA.counselling.href,
    linkLabel: "Talk to us",
  },
  {
    id: "resources",
    tone: "info",
    text: "UPSC syllabus map, booklist and PYQ guide — free",
    href: ROUTES.resources,
    linkLabel: "Download",
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
