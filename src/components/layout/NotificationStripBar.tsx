"use client";

import { BadgeCheck, CalendarClock, Megaphone } from "lucide-react";

import { TrackedLink } from "@/components/ui/TrackedLink";
import type { StripNotice } from "@/data/strip-notices";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

/**
 * Ticker speed, in seconds per character of the strip's text.
 *
 * The animation covers one full copy of the notices, so the duration has to
 * grow with the copy or a long notice would fly past. A tenth of a second per
 * character lands near reading pace on a phone.
 */
const SECONDS_PER_CHARACTER = 0.1;

/** Short lists still need long enough on screen to be read at all. */
const MIN_DURATION_SECONDS = 14;

/** Tone carries an icon as well as a word, so colour is never the only signal. */
const TONE_ICON = {
  info: Megaphone,
  success: BadgeCheck,
  warning: CalendarClock,
} as const;

/** One notice: icon, line, and its link. */
function NoticeLine({ notice }: { notice: StripNotice }) {
  const Icon = TONE_ICON[notice.tone];

  return (
    <>
      <Icon aria-hidden className="size-4 shrink-0 text-kesar" />
      <span className="truncate">{notice.text}</span>
      {notice.href ? (
        <TrackedLink
          href={notice.href}
          event={ANALYTICS_EVENTS.noticeClick}
          payload={{ location: "notification-strip", notice: notice.id }}
          className="shrink-0 whitespace-nowrap font-bold text-kesar underline decoration-kesar/60 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
        >
          {notice.linkLabel ?? "Details"}
        </TrackedLink>
      ) : null}
    </>
  );
}

/**
 * The notification strip above the header: the notices run past in one
 * continuous ticker, end to end, and start again — forever.
 *
 * Shape of the thing:
 *  - it sits above the header and scrolls away with the page, so only the
 *    navigation stays pinned. It cannot be dismissed.
 *  - the ticker is the notice list rendered twice inside one track that slides
 *    by exactly half its width, so the loop has no seam and no gap. The second
 *    copy is `inert` and hidden from assistive tech — it is the same text.
 *  - it pauses under the pointer or keyboard focus, so a link can be read and
 *    hit; with reduced motion it stands still and the row scrolls by hand.
 *
 * `notices` is computed on the server (see `stripNotices`) so the announcement
 * window is evaluated once, against one clock.
 */
export function NotificationStripBar({ notices }: { notices: StripNotice[] }) {
  const characters = notices.reduce(
    (total, notice) => total + notice.text.length + (notice.linkLabel?.length ?? 0),
    0,
  );
  const duration = Math.max(MIN_DURATION_SECONDS, characters * SECONDS_PER_CHARACTER);

  return (
    <div role="region" aria-label="Site notices" className="bg-indigo-900 text-white">
      {/* Full-bleed rather than inside a Container: the ticker should run off
          both edges of the screen, not start and stop at the page gutter. */}
      <div className="flex min-h-9 items-center gap-2 pr-2 pl-4 sm:pr-4 sm:pl-6 lg:pl-8">
        <div className="flex-1 overflow-hidden motion-reduce:overflow-x-auto">
          <div
            className="notice-ticker flex w-max items-center"
            style={{ animationDuration: `${duration}s` }}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1}
                inert={copy === 1 || undefined}
                className="flex w-max items-center"
              >
                {notices.map((notice) => (
                  <span
                    key={notice.id}
                    className="flex items-center gap-2 py-1.5 pr-12 text-small whitespace-nowrap text-white/90"
                  >
                    <NoticeLine notice={notice} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
