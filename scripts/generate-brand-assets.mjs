/**
 * Regenerates the static brand assets from the single source of Sopan geometry
 * in `src/lib/brand/sopan.ts`:
 *
 *   src/app/icon.svg               favicon / tab icon — indigo tile, white tick
 *   src/app/apple-icon.png         180px home-screen icon (iOS masks it itself)
 *   public/images/logo-mark.svg    the bare mark, indigo on light
 *   public/images/logo-mark-light.svg   the bare mark, reversed for indigo
 *
 * Run after changing the mark:  node --experimental-strip-types scripts/generate-brand-assets.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import sharp from "sharp";

import {
  BRAND_HEX,
  SOPAN_INTERVIEW,
  SOPAN_MAINS,
  SOPAN_PRELIMS,
  SOPAN_RADIUS,
  SOPAN_TRANSFORM,
  SOPAN_VIEWBOX,
} from "../src/lib/brand/sopan.ts";

const { width: W, height: H } = SOPAN_VIEWBOX;

const rect = ({ x, y, width, height }, fill) =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${SOPAN_RADIUS}" fill="${fill}"/>`;

/** The three steps, Prelims and Mains in `body`, Interview in kesar. */
const steps = (body) => `<g transform="${SOPAN_TRANSFORM}">
    ${[...SOPAN_PRELIMS, SOPAN_MAINS].map((s) => rect(s, body)).join("\n    ")}
    ${rect(SOPAN_INTERVIEW, BRAND_HEX.kesar)}
  </g>`;

/** The bare tick at its own proportions. */
const mark = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="VidyantIAS">
  ${steps(body)}
</svg>
`;

/** The app-icon tile: white tick on an indigo square, per the logo deck. */
const tile = (radius) => {
  const size = 512;
  const scale = 5; // 64 × 5 = 320px of tick inside a 512px tile
  const dx = (size - W * scale) / 2;
  const dy = (size - H * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="VidyantIAS">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${BRAND_HEX.indigo}"/>
  <g transform="translate(${dx} ${dy}) scale(${scale})">
  ${steps(BRAND_HEX.white)}
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
