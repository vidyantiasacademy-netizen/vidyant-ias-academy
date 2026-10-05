/**
 * Regenerates the static brand assets from the single source of nib geometry
 * in `src/lib/brand/nib.ts`:
 *
 *   src/app/icon.svg               favicon / tab icon — indigo tile, white nib
 *   src/app/apple-icon.png         180px home-screen icon (iOS masks it itself)
 *   public/images/logo-mark.svg    the bare mark, indigo on light
 *   public/images/logo-mark-light.svg   the bare mark, reversed for indigo
 *
 * Run after changing the mark:  node --experimental-strip-types scripts/generate-brand-assets.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import sharp from "sharp";

import { BRAND_HEX, NIB_BODY, NIB_HOLE, NIB_SLIT, NIB_VIEWBOX } from "../src/lib/brand/nib.ts";

const { width: W, height: H } = NIB_VIEWBOX;

/** The bare nib at its own proportions. */
const mark = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="VidyantIAS">
  <path d="${NIB_BODY} ${NIB_SLIT}" fill="${body}" fill-rule="evenodd" clip-rule="evenodd"/>
  <path d="${NIB_HOLE}" fill="${BRAND_HEX.kesar}"/>
</svg>
`;

/** The app-icon tile: white nib on an indigo square, per the logo deck. */
const tile = (radius) => {
  const size = 512;
  const scale = 5; // 64 × 5 = 320px of nib inside a 512px tile
  const dx = (size - W * scale) / 2;
  const dy = (size - H * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="VidyantIAS">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${BRAND_HEX.indigo}"/>
  <g transform="translate(${dx} ${dy}) scale(${scale})">
    <path d="${NIB_BODY} ${NIB_SLIT}" fill="${BRAND_HEX.white}" fill-rule="evenodd" clip-rule="evenodd"/>
    <path d="${NIB_HOLE}" fill="${BRAND_HEX.kesar}"/>
  </g>
</svg>
`;
};

const write = (path, body) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
  console.log("wrote", path);
};

write("public/images/logo-mark.svg", mark(BRAND_HEX.indigo));
write("public/images/logo-mark-light.svg", mark(BRAND_HEX.white));
write("src/app/icon.svg", tile(112));

await sharp(Buffer.from(tile(0))).resize(180, 180).png().toFile("src/app/apple-icon.png");
console.log("wrote src/app/apple-icon.png");
