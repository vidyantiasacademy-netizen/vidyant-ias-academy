/**
 * Sopan — the geometry of the VidyantIAS mark, in one place.
 *
 * Concept 03 of the logo deck: a tick that climbs Prelims, Mains and Interview
 * and turns saffron at the top. The three steps are drawn upright as a mirrored
 * "L" on a 28 × 58 grid, then the whole group is turned 45° into a tick by
 * `SOPAN_TRANSFORM`, which also seats it inside the 64 × 50 viewBox.
 *
 * Both the React mark (`components/ui/SopanMark`) and the static brand assets
 * (`scripts/generate-brand-assets.mjs` → favicon, app icon, OG mark) read these
 * shapes, so the mark can only ever be redrawn once.
 */

export const SOPAN_VIEWBOX = { width: 64, height: 50 } as const;

/** Turns the upright steps into a tick and centres it in the viewBox. */
export const SOPAN_TRANSFORM = "translate(37 -6.1) rotate(45)";

/** Corner radius shared by every step. */
export const SOPAN_RADIUS = 1.6;

type Step = { x: number; y: number; width: number; height: number };

/** Prelims — the V of the tick: the short arm and the foot of the long arm. */
export const SOPAN_PRELIMS: readonly Step[] = [
  { x: 0, y: 40, width: 28, height: 10 },
  { x: 18, y: 26, width: 10, height: 24 },
];

/** Mains — the middle step. */
export const SOPAN_MAINS: Step = { x: 18, y: 10, width: 10, height: 13 };

/** Interview — the top step, and the one saffron element in the identity. */
export const SOPAN_INTERVIEW: Step = { x: 18, y: -8, width: 10, height: 15 };

/**
 * Brand hexes, for the static assets only. Everything rendered in the app
 * takes its colour from the tokens in `app/globals.css` instead.
 */
export const BRAND_HEX = { indigo: "#1d2470", kesar: "#f39a1e", white: "#ffffff" } as const;
