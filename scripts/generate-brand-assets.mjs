/**
 * Regenerates the static brand assets from the single source of Breakout
 * geometry in `src/lib/brand/breakout.ts`:
 *
 *   src/app/icon.svg               favicon / tab icon — navy tile, cream disc
 *   src/app/apple-icon.png         180px home-screen icon (iOS masks it itself)
 *   public/images/logo-mark.svg    the bare mark, navy on light
 *   public/images/logo-mark-light.svg   the bare mark, reversed for dark
 *
 * Run after changing the mark:  npm run brand:assets
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import sharp from "sharp";

import {
  BRAND_HEX,
  BREAKOUT_BREAK,
  BREAKOUT_CIRCLE,
  BREAKOUT_DISC,
  BREAKOUT_VIEWBOX,
} from "../src/lib/brand/breakout.ts";

const { x: X, y: Y, width: W, height: H } = BREAKOUT_VIEWBOX;

/** The disc in `body` with the V cut through it, and the saffron break. */
const shapes = (body) => `<path d="${BREAKOUT_DISC}" fill="${body}"/>
  <path d="${BREAKOUT_BREAK}" fill="${BRAND_HEX.saffron}"/>`;

/** The bare mark at its own proportions. */
const mark = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${X} ${Y} ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="VidyantIAS">
  ${shapes(body)}
</svg>
`;

/** The app-icon tile, as on the concept sheet: a cream disc on a navy square, the V showing the tile through it. */
const tile = (radius) => {
  const size = 512;
  const scale = 5; // the disc is ~65% of the tile, as on the sheet
  // Centred on the disc across, on the whole mark (disc + break) down.
  const dx = size / 2 - BREAKOUT_CIRCLE.cx * scale;
  const dy = (size - H * scale) / 2 - Y * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="VidyantIAS">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${BRAND_HEX.navy}"/>
  <g transform="translate(${dx} ${dy}) scale(${scale})">
  ${shapes(BRAND_HEX.cream)}
  </g>
</svg>
`;
};

const write = (path, body) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
  console.log("wrote", path);
};

write("public/images/logo-mark.svg", mark(BRAND_HEX.navy));
write("public/images/logo-mark-light.svg", mark(BRAND_HEX.cream));
write("src/app/icon.svg", tile(112));

await sharp(Buffer.from(tile(0))).resize(180, 180).png().toFile("src/app/apple-icon.png");
console.log("wrote src/app/apple-icon.png");
