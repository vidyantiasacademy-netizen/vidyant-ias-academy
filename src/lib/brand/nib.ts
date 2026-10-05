/**
 * Kalam — the geometry of the VidyantIAS mark, in one place.
 *
 * Concept 01 of the logo deck: a fountain-pen nib whose slit and breather hole
 * together spell a hidden "i". Drawn on a 40 × 64 grid.
 *
 * Both the React mark (`components/ui/NibMark`) and the static brand assets
 * (`scripts/generate-brand-assets.mjs` → favicon, app icon, OG mark) read these
 * paths, so the mark can only ever be redrawn once.
 */

export const NIB_VIEWBOX = { width: 40, height: 64 } as const;

/** The body: a flat shoulder with soft corners, sides narrowing to a V. */
export const NIB_BODY =
  "M4 9C4 7.34 5.34 6 7 6H33C34.66 6 36 7.34 36 9C36 20 34.5 31 31 41C28.2 49 24.5 55.5 20 61C15.5 55.5 11.8 49 9 41C5.5 31 4 20 4 9Z";

/** The slit: opens just under the breather hole and runs out to the tip. */
export const NIB_SLIT =
  "M20 29.6C20.9 32.4 21.3 34.6 21.3 36.4L20 59.4L18.7 36.4C18.7 34.6 19.1 32.4 20 29.6Z";

/** The breather hole — the one saffron element in the identity. */
export const NIB_HOLE = "M20 20.9A4.4 4.4 0 1 0 20 29.7A4.4 4.4 0 1 0 20 20.9Z";

/**
 * Brand hexes, for the static assets only. Everything rendered in the app
 * takes its colour from the tokens in `app/globals.css` instead.
 */
export const BRAND_HEX = { indigo: "#1d2470", kesar: "#f39a1e", white: "#ffffff" } as const;
