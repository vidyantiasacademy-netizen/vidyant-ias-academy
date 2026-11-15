/**
 * Breakout — the geometry of the VidyantIAS mark, in one place.
 *
 * A V cut out of an indigo disc. Its right arm breaks through the rim and
 * leaves the circle in saffron: aspiration leaving the ordinary. The saffron
 * break is the one kesar element in the identity, and it stands for the
 * student.
 *
 * The disc is a single path (circle arc plus the V's edges, so the V is a
 * true hole and the arm genuinely cuts the rim); the break is a second path
 * whose lower edge follows the same circle, so the two meet flush.
 *
 * Both the React mark (`components/ui/BreakoutMark`) and the static brand
 * assets (`scripts/generate-brand-assets.mjs` → favicon, app icon, bare
 * marks) read these shapes, so the mark can only ever be redrawn once.
 */

/**
 * Measured off the approved concept sheet ("six professional directions",
 * 5 · Breakout): disc centre (50.5, 60.1), radius 33.2; the V has a flat top
 * (y 40.2) and a flat bottom (y 83.7), both arms slanting 0.4 across per 1
 * down; the break is the right arm carried on to y 13, cut off at the rim by
 * a straight chord. These are the tight bounds of the two paths.
 */
/** The disc, for layouts that centre on the circle rather than the bounds. */
export const BREAKOUT_CIRCLE = { cx: 50.5, cy: 60.1, r: 33.2 } as const;

export const BREAKOUT_VIEWBOX = { x: 17.3, y: 13, width: 65.7, height: 80.3 } as const;

/** The disc with the V cut out of it. */
export const BREAKOUT_DISC =
  "M63.26 29.45A33.2 33.2 0 1 0 73.66 36.31L54.70 83.70L46.00 83.70L28.60 40.20L41.00 40.20L50.40 61.60Z";

/** The right arm, beyond the rim — saffron. */
export const BREAKOUT_BREAK =
  "M63.26 29.45L70.64 13.0L82.98 13.0L73.66 36.31Z";

/**
 * The concept sheet's own colours, for the static assets only (the app reads
 * the same values from `--color-logo-*` in `app/globals.css`). The logo keeps
 * its navy and saffron even where the site's indigo and kesar differ.
 */
export const BRAND_HEX = { navy: "#0b1b3f", saffron: "#f29a2e", cream: "#f8f3e7" } as const;
