/**
 * Points in time stored as ISO-8601 strings, compared as points in time.
 *
 * Papers are scheduled in IST, and their times were stored as `+05:30` strings
 * (`istInputToIso`), while the server's clock produces `Z` strings. Compared as
 * text the two disagree by five and a half hours:
 * `"2026-10-20T10:00:00+05:30"` — 04:30 UTC — sorts *after*
 * `"2026-10-20T05:00:00.000Z"`, so a paper looked closed hours early, open hours
 * late, and a held result came out hours after its time.
 *
 * Two halves to the fix. New writes are normalised to UTC (`toUtcIso`, applied
 * in the validation schemas), so stored values sort and compare correctly even
 * as text — which a Firestore `orderBy` needs. And every comparison of a stored
 * time goes through the functions here, because a document written before the
 * fix keeps whatever offset it was written with.
 */

/** Milliseconds since the epoch. `NaN` for a string that is not a date. */
export function instantOf(value: string): number {
  return Date.parse(value);
}

/** Any ISO instant as UTC `Z`, e.g. `+05:30` 10:00 → `04:30:00.000Z`. */
export function toUtcIso(value: string): string {
  return new Date(Date.parse(value)).toISOString();
}

/** `toUtcIso` for an optional field. */
export function toUtcIsoOrNull(value: string | null | undefined): string | null {
  return value ? toUtcIso(value) : null;
}

/** The moment has arrived — at or before `now`. */
export function hasPassed(value: string, now: number = Date.now()): boolean {
  return Date.parse(value) <= now;
}

/** The moment is still ahead of `now`. */
export function isAhead(value: string, now: number = Date.now()): boolean {
  return Date.parse(value) > now;
}

type MaybeInstant = string | null | undefined;

function compare(a: MaybeInstant, b: MaybeInstant, direction: 1 | -1): number {
  // Missing sorts last in either direction: an unscheduled paper is never the
  // most urgent one, nor the newest.
  if (!a || !b) return a ? -1 : b ? 1 : 0;
  return (Date.parse(a) - Date.parse(b)) * direction;
}

/** Sort comparator over optional instants: earliest first, missing last. */
export function earliestFirst(a: MaybeInstant, b: MaybeInstant): number {
  return compare(a, b, 1);
}

/** Sort comparator over optional instants: latest first, missing last. */
export function latestFirst(a: MaybeInstant, b: MaybeInstant): number {
  return compare(a, b, -1);
}
