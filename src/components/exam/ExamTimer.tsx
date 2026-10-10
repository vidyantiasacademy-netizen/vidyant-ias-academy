"use client";

import { cn } from "@/lib/utils/cn";

/**
 * The countdown.
 *
 * It is a display, not a clock: the number comes from the server on every
 * heartbeat and ticks locally only to fill the gaps between them. Editing it in
 * the DOM changes nothing — the deadline that decides whether a write is
 * accepted is `testAttempts.expiresAt`, which the browser never sees.
 *
 * The last five minutes are the one saffron moment on the exam screen. Nothing
 * else on a paper should compete with the time running out, which is also why
 * there is no colour on the palette's "answered" state.
 */
export function ExamTimer({ seconds }: { seconds: number }) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  const urgent = safe <= 300;

  const label = [
    ...(hours > 0 ? [String(hours)] : []),
    String(minutes).padStart(2, "0"),
    String(secs).padStart(2, "0"),
  ].join(":");

  return (
    <div
      // Announced only every minute would be ideal; a per-second live region is
      // unusable with a screen reader, so the timer is polite and the runner
      // announces the five- and one-minute warnings as discrete messages.
      aria-live="off"
      className={cn(
        "inline-flex items-baseline gap-2 border px-3 py-1.5 tabular-nums",
        urgent
          ? "border-kesar-600 bg-kesar-100 text-kesar-700"
          : "border-line bg-white text-ink",
      )}
    >
      <span className="text-eyebrow font-semibold uppercase text-ink-secondary">
        Time left
      </span>
      <span className="text-body-lg font-semibold">{label}</span>
    </div>
  );
}
