"use client";

import {
  BadgeCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { TrackedLink } from "@/components/ui/TrackedLink";
import type { StripNotice } from "@/data/strip-notices";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { cn } from "@/lib/utils/cn";

/** Dismissal lasts for the browsing session, not forever — a new notice matters. */
const DISMISS_KEY = "vidyantias:strip-dismissed";

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

/** How long one notice holds the strip when the ticker is off (reduced motion). */
const STEP_MS = 6000;

/**
 * Dismissal lives in session storage, which React does not own — read it
 * through a store subscription rather than an effect, so the first client
 * render already knows, and a dismissal in another tab lands here too.
 */
function subscribeToDismissal(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readDismissal() {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY);
  } catch {
    // Private mode or blocked storage: show the strip.
    return null;
  }
}

/** The server has no session storage, so it renders the strip. */
function noDismissal() {
  return null;
}

/** Tone carries an icon as well as a word, so colour is never the only signal. */
const TONE_ICON = {
  info: Megaphone,
  success: BadgeCheck,
  warning: CalendarClock,
} as const;

/** One notice: icon, line, and its link. Used by both the ticker and the steps. */
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
          className="shrink-0 whitespace-nowrap font-semibold text-kesar underline decoration-kesar decoration-from-font underline-offset-4 transition-colors hover:text-white"
        >
          {notice.linkLabel ?? "Details"}
        </TrackedLink>
      ) : null}
    </>
  );
}

/**
 * The notification strip above the header: the notices run past in one
 * continuous ticker, end to end, and start again.
 *
 * Shape of the thing:
 *  - it scrolls away with the page. The header below it is sticky; stacking a
 *    permanent strip on top of it would cost a phone a tenth of its screen on
 *    every scroll.
 *  - the ticker is the notice list rendered twice inside one track that slides
 *    by exactly half its width, so the loop has no seam and no gap. The second
 *    copy is `inert` and hidden from assistive tech — it is the same text.
 *  - it stops on hover and on keyboard focus, so a link can be read and
 *    clicked rather than chased.
 *  - a visitor who prefers reduced motion gets no ticker at all: the strip
 *    falls back to one notice at a time with chevrons to step through, which
 *    is also what the site-wide reduced-motion rule would otherwise break.
 *  - dismissal is remembered in `sessionStorage` under a signature of the
 *    current notice ids, so adding or changing a notice brings the strip back.
 *
 * `notices` is computed on the server (see `stripNotices`) so the announcement
 * window is evaluated once, against one clock.
 */
export function NotificationStripBar({ notices }: { notices: StripNotice[] }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Assume motion is allowed: that is the common case, and it keeps the markup
  // the server sent — the effect below switches the strip over if it is not.
  const [allowsMotion, setAllowsMotion] = useState(true);
  const [dismissedHere, setDismissedHere] = useState(false);

  const count = notices.length;
  const signature = notices.map((notice) => notice.id).join("|");

  const storedSignature = useSyncExternalStore(
    subscribeToDismissal,
    readDismissal,
    noDismissal,
  );
  // A dismissal is remembered against the notices that were dismissed, so
  // editing or adding a notice brings the strip back.
  const isDismissed = dismissedHere || storedSignature === signature;

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  // A ticker is motion: opt out entirely when the OS says to.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowsMotion(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const isStepping = !allowsMotion && !isPaused && count > 1;

  useEffect(() => {
    if (!isStepping) return;
    const timer = window.setTimeout(() => goTo(index + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [goTo, index, isStepping]);

  function dismiss() {
    setDismissedHere(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, signature);
    } catch {
      // Nothing to do — the strip stays dismissed for this page view.
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (allowsMotion || count < 2) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    }
  }

  if (isDismissed) return null;

  const characters = notices.reduce(
    (total, notice) => total + notice.text.length + (notice.linkLabel?.length ?? 0),
    0,
  );
  const duration = Math.max(MIN_DURATION_SECONDS, characters * SECONDS_PER_CHARACTER);

  return (
    <div
      role="region"
      aria-label="Site notices"
      data-paused={isPaused}
      className="group/strip bg-indigo-900 text-white"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      {/* Full-bleed rather than inside a Container: the ticker should run off
          both edges of the screen, not start and stop at the page gutter. */}
      <div className="flex min-h-10 items-center gap-2 pr-2 pl-4 sm:pr-4 sm:pl-6 lg:pl-8">
        {allowsMotion ? (
          <div className="flex-1 overflow-hidden">
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
                      className="flex items-center gap-2 py-2 pr-10 text-small whitespace-nowrap"
                    >
                      <NoticeLine notice={notice} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid min-w-0 flex-1 overflow-hidden">
              {notices.map((notice, slide) => (
                <p
                  key={notice.id}
                  aria-hidden={slide !== index}
                  inert={slide !== index || undefined}
                  className={cn(
                    "col-start-1 row-start-1 flex min-w-0 items-center gap-2 py-2 text-small",
                    slide === index ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  <NoticeLine notice={notice} />
                </p>
              ))}
            </div>

            {count > 1 ? (
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous notice"
                  className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft aria-hidden className="size-4" />
                </button>
                <span aria-hidden className="text-small tabular-nums text-white/70">
                  {index + 1}
                  <span className="text-white/45"> / {count}</span>
                </span>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  aria-label="Next notice"
                  className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronRight aria-hidden className="size-4" />
                </button>
              </div>
            ) : null}

            {/* The step is visual; announce it once, politely. */}
            <p aria-live="polite" aria-atomic="true" className="sr-only">
              {`Notice ${index + 1} of ${count}: ${notices[index].text}`}
            </p>
          </>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notices"
          className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
