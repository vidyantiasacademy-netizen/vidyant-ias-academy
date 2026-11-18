/**
 * Renders the designed course-card posters — the 3:2 artwork at the top of
 * every programme card on the homepage and /courses:
 *
 *   public/images/courses/posters/<slug>.webp
 *   src/lib/courses/posters.ts      the slugs that have one (read by the catalogue)
 *
 * Each poster is a printed-flyer layout in the brand palette: the programme
 * name set big, what it is for, how it is taught, what it covers, and a line
 * drawing for the stage. Everything on it is a fact the course record already
 * states (modes, modules) — no dates, counts or results, so a poster never
 * goes stale or claims something the institute has not verified.
 *
 * Modes and module counts come from the seed data; the display copy is
 * written below per slug. A course added in the admin panel has no poster
 * until it gets an entry here, and its card falls back to the stage photo.
 *
 * Run after adding or renaming a programme:  npm run courses:posters
 */
import { mkdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { ImageResponse } from "next/og.js";
import sharp from "sharp";

import { LOGO_HEX, MARK_VIEWBOX } from "../src/lib/brand/mark.ts";
import { SEED_COURSES } from "./seed/courses.mjs";

const WIDTH = 1200;
const HEIGHT = 800;

/** Site palette (`app/globals.css`). */
const C = {
  indigo: "#041840",
  indigo700: "#14306e",
  indigo900: "#031230",
  kesar: "#f29057",
  kesar100: "#fceadb",
  cream: LOGO_HEX.cream,
  ink: "#3a4560",
};

const DELIVERY = {
  offline: "Classroom",
  "online-live": "Live Online",
  recorded: "Recorded",
  hybrid: "Hybrid",
};

/* ------------------------------------------------------------------ */
/* Line drawings — one per stage, indigo with a single kesar accent.   */
/* ------------------------------------------------------------------ */

const svg = (viewBox, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`;

const range = (n) => Array.from({ length: n }, (_, i) => i);

/** Sansad Bhavan: the long circular colonnade under a low dome. */
const parliament = () => {
  const columns = range(31)
    .map((i) => `<rect x="${52 + i * 14.2}" y="128" width="7" height="86" rx="1"/>`)
    .join("");
  const windows = range(15)
    .map((i) => `<rect x="${82 + i * 25.4}" y="86" width="10" height="12" fill="${C.cream}"/>`)
    .join("");
  return svg(
    "0 0 520 270",
    `<g fill="${C.indigo}">
      <rect x="236" y="22" width="3" height="22"/>
      <path d="M239 22 L262 28 L239 34Z" fill="${C.kesar}"/>
      <rect x="230" y="40" width="20" height="8"/>
      <path d="M200 76 A40 30 0 0 1 280 76Z"/>
      <rect x="64" y="76" width="392" height="30"/>
      ${windows}
      <rect x="40" y="106" width="440" height="14"/>
      <rect x="46" y="120" width="428" height="6"/>
      ${columns}
      <rect x="40" y="214" width="440" height="10"/>
      <rect x="22" y="224" width="476" height="16"/>
      <rect x="0" y="240" width="520" height="8"/>
      <rect x="0" y="254" width="520" height="3"/>
    </g>`,
  );
};

/** India Gate: the arch, its stepped cornice and the shallow bowl on top. */
const indiaGate = () =>
  svg(
    "0 0 520 300",
    `<g fill="${C.indigo}">
      <path d="M232 36 Q260 18 288 36 L284 46 L236 46Z" fill="${C.kesar}"/>
      <rect x="220" y="46" width="80" height="12"/>
      <rect x="196" y="58" width="128" height="16"/>
      <rect x="178" y="74" width="164" height="22"/>
      <rect x="170" y="96" width="180" height="10"/>
      <path fill-rule="evenodd" d="M180 106 H340 V262 H180Z M226 262 V170 A34 34 0 0 1 294 170 V262Z"/>
      <rect x="196" y="118" width="128" height="6" fill="${C.cream}"/>
      <rect x="164" y="262" width="192" height="12"/>
      <rect x="40" y="274" width="440" height="8"/>
      <rect x="0" y="288" width="520" height="3"/>
      <rect x="60" y="226" width="6" height="48"/>
      <circle cx="63" cy="220" r="10"/>
      <rect x="454" y="226" width="6" height="48"/>
      <circle cx="457" cy="220" r="10"/>
    </g>`,
  );

/** A fountain-pen nib over ruled answer lines. */
const nib = () =>
  svg(
    "0 0 520 300",
    `<g fill="none" stroke="${C.indigo}" stroke-linecap="round">
      ${range(5)
        .map((i) => `<line x1="${i === 4 ? 150 : 110}" y1="${120 + i * 36}" x2="${i === 4 ? 330 : 500}" y2="${120 + i * 36}" stroke-width="3" opacity="0.35"/>`)
        .join("")}
      <path d="M120 228 C140 204 160 250 186 222 S226 200 250 226 S290 244 306 220" stroke-width="6" stroke="${C.kesar}"/>
    </g>
    <g transform="translate(300 20) rotate(35 90 120)" fill="${C.indigo}">
      <path d="M60 0 H120 V70 H60Z"/>
      <path d="M50 76 H130 L130 120 Q130 180 90 250 Q50 180 50 120Z"/>
      <circle cx="90" cy="150" r="9" fill="${C.cream}"/>
      <rect x="88" y="160" width="4" height="86" fill="${C.cream}"/>
    </g>`,
  );

/** The Ashoka Chakra beside a stack of reference books. */
const chakraBooks = () => {
  const spokes = range(24)
    .map((i) => {
      const a = (i * Math.PI) / 12;
      const x = 130 + Math.cos(a) * 82;
      const y = 150 + Math.sin(a) * 82;
      return `<line x1="130" y1="150" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    })
    .join("");
  const books = [
    { x: 280, y: 222, w: 220, h: 34 },
    { x: 296, y: 186, w: 192, h: 36 },
    { x: 270, y: 152, w: 210, h: 34 },
    { x: 300, y: 120, w: 170, h: 32 },
  ]
    .map(
      (b, i) => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h - 4}" rx="3" fill="${i === 2 ? C.kesar : C.indigo}"/>
      <rect x="${b.x + 18}" y="${b.y + 8}" width="${b.w * 0.45}" height="5" fill="${C.cream}"/>
      <rect x="${b.x + b.w - 30}" y="${b.y}" width="6" height="${b.h - 4}" fill="${C.cream}" opacity="0.6"/>`,
    )
    .join("");
  return svg(
    "0 0 520 270",
    `<g stroke="${C.indigo}" stroke-width="4" fill="none">
      <circle cx="130" cy="150" r="96" stroke-width="12"/>
      <circle cx="130" cy="150" r="82" stroke-width="3"/>
      ${spokes}
    </g>
    <circle cx="130" cy="150" r="16" fill="${C.indigo}"/>
    ${books}
    <rect x="0" y="256" width="520" height="4" fill="${C.indigo}"/>`,
  );
};

/** An OMR answer sheet and a stopwatch. */
const omr = () => {
  const rows = range(7)
    .map((r) =>
      range(4)
        .map((c) => {
          const filled = (r * 3 + c * 2) % 4 === 1;
          return `<circle cx="${92 + c * 40}" cy="${92 + r * 26}" r="10" ${
            filled ? `fill="${C.indigo}"` : `fill="none" stroke="${C.indigo}" stroke-width="3"`
          }/>`;
        })
        .join("") + `<rect x="40" y="${86 + r * 26}" width="22" height="10" fill="${C.indigo}" opacity="0.5"/>`,
    )
    .join("");
  return svg(
    "0 0 520 300",
    `<g transform="rotate(-6 150 160)">
      <rect x="20" y="30" width="250" height="260" rx="6" fill="#ffffff" stroke="${C.indigo}" stroke-width="5"/>
      <rect x="20" y="30" width="250" height="34" rx="6" fill="${C.indigo}"/>
      <rect x="40" y="43" width="110" height="8" fill="${C.cream}"/>
      ${rows}
    </g>
    <g>
      <rect x="380" y="62" width="40" height="18" rx="4" fill="${C.indigo}"/>
      <rect x="392" y="80" width="16" height="16" fill="${C.indigo}"/>
      <circle cx="400" cy="184" r="96" fill="${C.cream}" stroke="${C.indigo}" stroke-width="12"/>
      <path d="M400 184 L400 104 A80 80 0 0 1 469 224Z" fill="${C.kesar}"/>
      <line x1="400" y1="184" x2="400" y2="112" stroke="${C.indigo}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="400" cy="184" r="12" fill="${C.indigo}"/>
    </g>`,
  );
};

/* ------------------------------------------------------------------ */
/* Display copy per programme.                                         */
/* ------------------------------------------------------------------ */

/**
 * `title` is set on two lines, so each line is one or two words.
 * `covers` must be things the course's own curriculum lists.
 */
const POSTERS = {
  "foundation-program": {
    eyebrow: "Start from zero",
    title: ["Foundation", "Program"],
    subtitle: "for UPSC CSE · Prelims + Mains",
    covers: ["GS Core", "Current Affairs", "Prelims Skills", "Mains Foundation", "CSAT"],
    art: parliament,
  },
  "prelims-program": {
    eyebrow: "Clear the first gate",
    title: ["Prelims", "Program"],
    subtitle: "for UPSC Civil Services Prelims",
    covers: ["Revision Modules", "Current Affairs", "Question Practice", "CSAT"],
    art: indiaGate,
  },
  "mains-program": {
    eyebrow: "Write to score",
    title: ["Mains", "Program"],
    subtitle: "GS I – IV · Essay · Ethics",
    covers: ["GS I", "GS II", "GS III", "GS IV & Essay", "Answer Writing Lab"],
    art: nib,
  },
  "optional-subjects": {
    eyebrow: "500 marks, one subject",
    title: ["Optional", "Subjects"],
    subtitle: "Paper I + Paper II for UPSC Mains",
    covers: ["Full Syllabus", "Application", "Tests & Evaluation"],
    art: chakraBooks,
  },
  "test-series": {
    eyebrow: "Practise under exam conditions",
    title: ["Test", "Series"],
    subtitle: "UPSC Prelims + Mains",
    covers: ["Prelims Tests", "Mains Tests", "Performance Analysis"],
    art: omr,
  },
  "upsc-prelims-test-series": {
    eyebrow: "Practise under exam conditions",
    title: ["Prelims", "Test Series"],
    subtitle: "for UPSC Civil Services Prelims",
    covers: ["Prelims Tests", "Performance Analysis"],
    art: omr,
  },
};

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/** Satori takes plain `{ type, props }` trees; every multi-child box must flex. */
const h = (type, style, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.flat() },
});

const dataUri = (markup) => `data:image/svg+xml;base64,${Buffer.from(markup).toString("base64")}`;

/** The bare mark for light surfaces, as written by `npm run brand:assets`. */
const MARK = dataUri(readFileSync("public/images/logo-mark.svg", "utf8"));
const MARK_HEIGHT = 81;
const MARK_WIDTH = Math.round((MARK_HEIGHT * MARK_VIEWBOX.width) / MARK_VIEWBOX.height);

function poster({ eyebrow, title, subtitle, covers, art }, { modes, modules }) {
  const img = (src, style) => ({ type: "img", props: { src, style } });

  return h(
    "div",
    {
      width: WIDTH,
      height: HEIGHT,
      position: "relative",
      flexDirection: "column",
      padding: "64px 72px",
      backgroundColor: C.cream,
      backgroundImage: `radial-gradient(circle at 92% 18%, ${C.kesar100} 0%, ${C.cream} 55%)`,
      fontFamily: "Inter",
      color: C.indigo,
    },
    // Kesar corner wedge, bottom left.
    img(dataUri(svg("0 0 10 10", `<path d="M0 0 L10 10 H0Z" fill="${C.kesar}"/>`)), {
      position: "absolute",
      left: 0,
      bottom: 0,
      width: 96,
      height: 96,
    }),
    // Line drawing, bottom right.
    img(dataUri(art()), { position: "absolute", right: 56, bottom: 52, width: 500 }),
    // Mark, top right.
    img(MARK, { position: "absolute", top: 56, right: 64, width: MARK_WIDTH, height: MARK_HEIGHT }),

    h(
      "div",
      { alignItems: "center", gap: 16, fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.indigo700 },
      h("div", { width: 48, height: 4, backgroundColor: C.kesar }),
      eyebrow,
    ),
    h(
      "div",
      { flexDirection: "column", marginTop: 22, fontFamily: "Jakarta", fontWeight: 800, fontSize: 112, lineHeight: 0.98, letterSpacing: -3, textTransform: "uppercase" },
      ...title.map((line) => h("div", {}, line)),
    ),
    h("div", { marginTop: 18, fontFamily: "Jakarta", fontWeight: 600, fontSize: 36, color: C.ink }, subtitle),

    h(
      "div",
      { marginTop: 32, alignItems: "center", gap: 18 },
      h(
        "div",
        { padding: "10px 28px", borderRadius: 999, backgroundColor: C.indigo, color: C.cream, fontFamily: "Fraunces", fontStyle: "italic", fontSize: 30 },
        modes,
      ),
      // Two modules reads as thin, not as a fact worth a badge.
      modules >= 3
        ? h(
            "div",
            { padding: "8px 18px", border: `3px solid ${C.indigo}`, borderRadius: 10, fontSize: 26, fontWeight: 700, alignItems: "center", gap: 10 },
            h("div", { width: 14, height: 14, backgroundColor: C.kesar, borderRadius: 3 }),
            `${modules} Modules`,
          )
        : [],
    ),

    h(
      "div",
      {
        marginTop: "auto",
        maxWidth: 540,
        flexWrap: "wrap",
        alignSelf: "flex-start",
        padding: "14px 20px",
        border: `2px dashed ${C.indigo}`,
        borderRadius: 8,
        backgroundColor: "rgba(253,241,221,0.85)",
        fontSize: 24,
        fontWeight: 500,
        lineHeight: 1.45,
        color: C.indigo900,
      },
      // One box per item, so a line only ever breaks between items.
      ...covers.map((item, i) =>
        h(
          "div",
          { whiteSpace: "nowrap", alignItems: "center" },
          item,
          i < covers.length - 1 ? h("div", { margin: "0 12px", color: C.kesar, fontWeight: 700 }, "|") : [],
        ),
      ),
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Fonts (Google Fonts TTF, cached under node_modules/.cache).         */
/* ------------------------------------------------------------------ */

const FONT_CACHE = "node_modules/.cache/course-posters";
const FONTS = [
  { name: "Jakarta", family: "Plus+Jakarta+Sans:wght@600", weight: 600 },
  { name: "Jakarta", family: "Plus+Jakarta+Sans:wght@800", weight: 800 },
  { name: "Inter", family: "Inter:wght@500", weight: 500 },
  { name: "Inter", family: "Inter:wght@700", weight: 700 },
  { name: "Fraunces", family: "Fraunces:ital,wght@1,600", weight: 600, style: "italic" },
];

async function loadFont({ name, family, weight, style = "normal" }) {
  const file = join(FONT_CACHE, `${family.replace(/[^a-z0-9]+/gi, "-")}.ttf`);
  if (!existsSync(file)) {
    // An old user agent gets TrueType, which Satori can read (it cannot read WOFF2).
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}`, {
      headers: { "User-Agent": "Mozilla/4.0" },
    }).then((r) => r.text());
    const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
    if (!url) throw new Error(`No TTF for ${family}`);
    mkdirSync(FONT_CACHE, { recursive: true });
    writeFileSync(file, Buffer.from(await fetch(url).then((r) => r.arrayBuffer())));
  }
  return { name, data: readFileSync(file), weight, style };
}

/* ------------------------------------------------------------------ */

const fonts = await Promise.all(FONTS.map(loadFont));
const written = [];

for (const { firestore, sanity } of SEED_COURSES) {
  const copy = POSTERS[firestore.slug];
  if (!copy) {
    console.warn(`  skip    ${firestore.slug} — no poster copy in POSTERS`);
    continue;
  }

  const modes = (firestore.modes ?? ["offline", "online-live"]).map((m) => DELIVERY[m]).join(" · ");
  const modules = sanity.curriculum?.length ?? 0;

  const png = Buffer.from(
    await new ImageResponse(poster(copy, { modes, modules }), { width: WIDTH, height: HEIGHT, fonts }).arrayBuffer(),
  );
  const out = `public/images/courses/posters/${firestore.slug}.webp`;
  mkdirSync(dirname(out), { recursive: true });
  await sharp(png).webp({ quality: 86 }).toFile(out);
  written.push(firestore.slug);
  console.log("wrote", out);
}

writeFileSync(
  "src/lib/courses/posters.ts",
  `// Generated by scripts/generate-course-posters.mjs — do not edit by hand.

/** Course slugs with a designed card poster at /images/courses/posters/<slug>.webp. */
export const COURSE_POSTER_SLUGS: ReadonlySet<string> = new Set(${JSON.stringify(written, null, 2)});
`,
);
console.log("wrote src/lib/courses/posters.ts");
