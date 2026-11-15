/**
 * The VidyantIAS mark, in one place: a V cut out of a disc, with a saffron
 * blade rising out of its right arm and breaking past the rim — a tick that
 * keeps going. Redrawn as clean vectors from the institute's logo artwork.
 *
 * Both the React mark (`components/ui/BrandMark`) and the static brand assets
 * (`scripts/generate-brand-assets.mjs` → favicon, app icon, OG mark) read these
 * shapes, so the mark is only ever drawn once.
 *
 * The V is a cut, not a fill: wherever the mark sits, the V shows the surface
 * behind it. Only the disc changes with the surface (navy on light, cream on
 * dark); the blade is always saffron.
 */

export const MARK_VIEWBOX = { width: 294, height: 322 } as const;

/** The disc the V is cut from. */
export const MARK_DISC = { cx: 134, cy: 187, r: 132 } as const;

/** The V, cut through the disc. Its right arm runs out through the rim. */
export const MARK_V = "M54 128H102L142 225L212 42H254L158 288H118Z";

/** The saffron blade: from the V's inner point, up and out past the rim. */
export const MARK_BLADE =
  "M140 223C150 182 170 132 185 92C192 72 200 50 206 31C232 16 260 8 290 4C276 17 266 28 258 40C244 64 235 87 224 106C205 137 170 182 142 225Z";

/** Colours of the logo artwork. `saffronOnLight` is a shade deeper for white. */
export const LOGO_HEX = {
  navy: "#08143c",
  cream: "#f2eee4",
  saffron: "#f68b43",
  saffronOnLight: "#ec7a2d",
} as const;

/** The line set under the full lockup. */
export const LOGO_TAGLINE = "Right knowledge. Right direction. Every step.";
