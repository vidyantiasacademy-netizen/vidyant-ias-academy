/**
 * Regenerates the static brand assets from the single source of mark geometry
 * in `src/lib/brand/mark.ts`:
 *
 *   src/app/icon.svg                    favicon / tab icon — navy tile, cream disc
 *   src/app/apple-icon.png              180px home-screen icon (iOS masks it itself)
 *   public/images/logo-mark.svg         the bare mark for light surfaces (navy disc)
 *   public/images/logo-mark-light.svg   the bare mark for dark surfaces (cream disc)
 *
 * Run after changing the mark:  npm run brand:assets
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import sharp from "sharp";

import { LOGO_HEX, MARK_BLADE, MARK_DISC, MARK_V, MARK_VIEWBOX } from "../src/lib/brand/mark.ts";

const { width: W, height: H } = MARK_VIEWBOX;
const { cx, cy, r } = MARK_DISC;

/** The disc with the V cut through it (a mask, so the V shows what is behind), plus the blade. */
const shapes = (disc, blade) => `<mask id="v" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/>
    <path d="${MARK_V}" fill="#000"/>
  </mask>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${disc}" mask="url(#v)"/>
  <path d="${MARK_BLADE}" fill="${blade}"/>`;

const mark = (disc, blade) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="VidyantIAS">
  ${shapes(disc, blade)}
</svg>
`;

/** The app-icon tile: the cream mark on navy, as in the logo artwork. */
const tile = (radius) => {
  const size = 512;
  const scale = 1.3; // 322 × 1.3 ≈ 419px of mark inside a 512px tile
  const dx = (size - W * scale) / 2;
  const dy = (size - H * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="VidyantIAS">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${LOGO_HEX.navy}"/>
  <g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) scale(${scale})">
  ${shapes(LOGO_HEX.cream, LOGO_HEX.saffron)}
  </g>
</svg>
`;
};

const write = (path, body) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
  console.log("wrote", path);
};

write("public/images/logo-mark.svg", mark(LOGO_HEX.navy, LOGO_HEX.saffronOnLight));
write("public/images/logo-mark-light.svg", mark(LOGO_HEX.cream, LOGO_HEX.saffron));
write("src/app/icon.svg", tile(112));

await sharp(Buffer.from(tile(0))).resize(180, 180).png().toFile("src/app/apple-icon.png");
console.log("wrote src/app/apple-icon.png");
