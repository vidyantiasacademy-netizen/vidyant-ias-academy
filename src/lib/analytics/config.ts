/**
 * Analytics vendor ids, read from the environment.
 *
 * Both are interpolated into inline scripts, so each is checked against the
 * vendor's id format rather than trusted: a malformed value disables that
 * vendor instead of becoming script text. Unset means off — local development
 * and preview deploys send nothing unless someone opts in.
 */

const GA_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;
const CLARITY_ID_PATTERN = /^[a-z0-9]{6,20}$/;

function validated(value: string | undefined, pattern: RegExp): string | null {
  const trimmed = value?.trim();
  return trimmed && pattern.test(trimmed) ? trimmed : null;
}

/** Google Analytics 4 measurement id, e.g. `G-ABC123XYZ9`. */
export const GA_MEASUREMENT_ID = validated(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  GA_ID_PATTERN,
);

/** Microsoft Clarity project id — heatmaps and session recordings. */
export const CLARITY_PROJECT_ID = validated(
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  CLARITY_ID_PATTERN,
);
