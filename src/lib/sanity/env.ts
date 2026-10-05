/**
 * Sanity project configuration.
 *
 * Project id and dataset are public — they appear in every CDN request the
 * browser makes. The write/read token is not, and lives only in
 * `SANITY_API_READ_TOKEN` (server-only, no `NEXT_PUBLIC_` prefix).
 */

export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/**
 * Pinned date, not `"vX"`. An API version is a contract: pinning it means a
 * Sanity API change cannot alter what a published GROQ query returns. Bump it
 * deliberately, and re-test the queries when you do.
 */
export const SANITY_API_VERSION =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-01-01";

/** Studio path, mounted inside this app. */
export const SANITY_STUDIO_PATH = "/studio";

export function isSanityConfigured(): boolean {
  return SANITY_PROJECT_ID.length > 0;
}

/** Cache lifetimes, in seconds. Content moves at editorial speed, not app speed. */
export const SANITY_REVALIDATE = {
  /** Blog posts, faculty bios, FAQs — edited rarely. */
  stable: 3600,
  /** Current affairs — published daily. */
  daily: 600,
} as const;
