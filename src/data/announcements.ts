/**
 * Noticeboard entries are Sanity `announcement` documents, windowed by
 * `startsAt` / `endsAt` and read through `getSiteAnnouncements()` in
 * `src/lib/content/site.ts`. What stays here is page copy.
 */

/** What the board carries once it is in use — shown while it is still empty. */
export const ANNOUNCEMENT_KINDS = [
  "Batch start dates and admission deadlines",
  "Test calendar changes and result declarations",
  "Holiday, timing and venue changes",
] as const;
