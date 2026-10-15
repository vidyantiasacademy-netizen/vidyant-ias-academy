/**
 * Study streak, folded out of `activity` timestamps.
 *
 * Pure, so it is testable without Firestore. Days are Indian Standard Time
 * calendar days: a student revising at 00:30 IST has studied "today", not
 * "yesterday" in UTC. The streak is still alive until the end of the day after
 * the last active one — missing today only breaks it at midnight.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** `YYYY-MM-DD` of an instant, in IST. */
export function istDay(instant: Date): string {
  return new Date(instant.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function previousDay(day: string): string {
  return new Date(new Date(`${day}T00:00:00.000Z`).getTime() - DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export interface Streak {
  current: number;
  longest: number;
  last7Days: { date: string; active: boolean }[];
}

export function computeStreak(timestamps: readonly string[], now: Date = new Date()): Streak {
  const days = new Set(
    timestamps
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(istDay),
  );

  const today = istDay(now);
  const yesterday = previousDay(today);

  let current = 0;
  let cursor = days.has(today) ? today : days.has(yesterday) ? yesterday : null;
  while (cursor && days.has(cursor)) {
    current += 1;
    cursor = previousDay(cursor);
  }

  let longest = 0;
  let run = 0;
  let last: string | null = null;
  for (const day of [...days].sort()) {
    run = last !== null && previousDay(day) === last ? run + 1 : 1;
    longest = Math.max(longest, run);
    last = day;
  }

  const last7Days: Streak["last7Days"] = [];
  let day = today;
  for (let index = 0; index < 7; index += 1) {
    last7Days.unshift({ date: day, active: days.has(day) });
    day = previousDay(day);
  }

  return { current, longest: Math.max(longest, current), last7Days };
}
