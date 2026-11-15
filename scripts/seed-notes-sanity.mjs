/**
 * Seeds one sample note (`studyNote`) so editors can see the shape of a
 * finished note in the Studio before writing their own. Notes are PDFs: the
 * text below is rendered to a PDF with headless Chrome, uploaded to Sanity
 * and attached as the note's file.
 *
 * Without a published note it creates a DRAFT (Studio → Notes), which an
 * editor reviews and publishes. With the note already published, it swaps in
 * the freshly rendered PDF and keeps everything else the editors wrote.
 *
 *   npm run seed:notes:sanity
 *   npm run seed:notes:sanity -- --replace   # overwrite the draft
 *   npm run seed:notes:sanity -- --dry-run   # render the PDF only, write nothing
 *   npm run seed:notes:sanity -- --publish   # publish the draft (makes it public)
 *
 * Needs Google Chrome (or set CHROME_PATH).
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { sanityFlags, seedClient } from "./seed/sanity.mjs";

const flags = sanityFlags();
const client = seedClient(flags);

const SUBJECT_ID = "subject-polity";

const body = [
  "Part III of the Constitution (Articles 12 to 35) lists the Fundamental Rights. They limit what the State may do, and Article 32 lets a citizen go straight to the Supreme Court when one is violated.",

  { h2: "Two articles that make the rest work" },
  {
    bullets: [
      "Article 12 defines “the State”: the Government and Parliament of India, the Government and Legislature of each State, and all local and other authorities within India or under the control of the Government of India.",
      "Article 13 makes any law that is inconsistent with, or takes away, a Fundamental Right void to the extent of that inconsistency. It is the textual basis of judicial review of laws.",
    ],
  },

  { h2: "The six groups of rights" },
  {
    numbers: [
      "Right to Equality — Articles 14 to 18: equality before law and equal protection of laws (14), no discrimination on grounds of religion, race, caste, sex or place of birth (15), equality of opportunity in public employment (16), abolition of untouchability (17), abolition of titles (18).",
      "Right to Freedom — Articles 19 to 22: the six freedoms of Article 19, protection in respect of conviction for offences (20), protection of life and personal liberty (21), right to elementary education for children aged 6 to 14 (21A), protection against arbitrary arrest and detention (22).",
      "Right against Exploitation — Articles 23 and 24: no trafficking in human beings or forced labour (23), no employment of children below 14 in factories, mines or other hazardous work (24).",
      "Right to Freedom of Religion — Articles 25 to 28.",
      "Cultural and Educational Rights — Articles 29 and 30, including the right of minorities to establish and administer educational institutions.",
      "Right to Constitutional Remedies — Article 32.",
    ],
  },
  "The right to property was originally a Fundamental Right (Articles 19(1)(f) and 31). The 44th Amendment (1978) removed it from Part III; it is now a constitutional right under Article 300A.",

  { h2: "Facts UPSC likes to test" },
  {
    bullets: [
      "Rights available only to citizens: Articles 15, 16, 19, 29 and 30. The others are available to every person, including foreigners.",
      "Rights enforceable against private persons as well as the State: Articles 15(2), 17, 23 and 24.",
      "Article 21A was inserted by the 86th Amendment (2002).",
      "During a National Emergency, the rights under Articles 20 and 21 cannot be suspended — a safeguard added by the 44th Amendment.",
      "Dr B. R. Ambedkar called Article 32 the “heart and soul” of the Constitution.",
    ],
  },

  { h2: "The five writs (Article 32 and Article 226)" },
  {
    bullets: [
      "Habeas corpus — produce a detained person before the court.",
      "Mandamus — command a public authority to perform its legal duty.",
      "Prohibition — stop a lower court or tribunal from exceeding its jurisdiction.",
      "Certiorari — quash an order already passed by a lower court or tribunal.",
      "Quo warranto — ask by what authority a person holds a public office.",
    ],
  },
  "High Courts issue writs under Article 226, which is wider than Article 32: it covers Fundamental Rights and “any other purpose”.",

  { h2: "The closing articles" },
  {
    bullets: [
      "Article 33 lets Parliament restrict the rights of the armed forces, police and similar forces.",
      "Article 34 restricts the rights while martial law is in force in an area.",
      "Article 35 gives Parliament, not the State Legislatures, the power to make laws on certain rights in Part III.",
    ],
  },

  { h2: "Practise" },
  "Mains: “Article 21 has been the most expansively interpreted Fundamental Right.” Discuss with three examples of rights the Supreme Court has read into it.",
];

const note = {
  _id: "drafts.studyNote-sample-fundamental-rights",
  _type: "studyNote",
  language: "en",
  title: "Fundamental Rights — Articles 12 to 35",
  slug: { _type: "slug", current: "fundamental-rights-articles-12-35" },
  subject: { _type: "reference", _ref: SUBJECT_ID },
  stages: ["Prelims", "Mains"],
  summary:
    "The six groups of rights, who they protect, the five writs, and the one-line facts Prelims keeps asking about.",
  revisedAt: new Date().toISOString().slice(0, 10),
  order: 1,
};

const DRAFT_ID = note._id;
const PUBLISHED_ID = DRAFT_ID.replace(/^drafts\./, "");

// --publish: promote the current draft (with any Studio edits) to published.
if (process.argv.includes("--publish")) {
  const draft = await client.getDocument(DRAFT_ID);
  if (!draft) {
    console.error(`No draft ${DRAFT_ID} to publish. Run without --publish first.`);
    process.exit(1);
  }
  if (flags.dryRun) {
    console.log(`Would publish ${DRAFT_ID} → ${PUBLISHED_ID}`);
    process.exit(0);
  }
  // Drop the system fields Sanity sets itself; keep everything an editor wrote.
  const fields = Object.fromEntries(
    Object.entries(draft).filter(([key]) => !["_rev", "_createdAt", "_updatedAt"].includes(key)),
  );
  await client
    .transaction()
    .createOrReplace({ ...fields, _id: PUBLISHED_ID })
    .delete(DRAFT_ID)
    .commit();
  console.log(`Published: ${PUBLISHED_ID} — "${draft.title}"`);
  process.exit(0);
}

const subject = await client.fetch(`*[_id == $id][0]{ _id, title }`, { id: SUBJECT_ID });
if (!subject) {
  console.error(`Subject "${SUBJECT_ID}" not found. Run \`npm run seed:content:sanity\` first.`);
  process.exit(1);
}

// ── Render the note to a PDF ────────────────────────────────────────────────

const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function bodyHtml(items) {
  return items
    .map((item) => {
      if (typeof item === "string") return `<p>${escape(item)}</p>`;
      if (item.h2) return `<h2>${escape(item.h2)}</h2>`;
      const tag = item.numbers ? "ol" : "ul";
      const list = item.numbers ?? item.bullets;
      return `<${tag}>${list.map((li) => `<li>${escape(li)}</li>`).join("")}</${tag}>`;
    })
    .join("\n");
}

const revised = new Intl.DateTimeFormat("en-IN", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
}).format(new Date(`${note.revisedAt}T00:00:00Z`));

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escape(note.title)}</title>
<style>
  @page { size: A4; margin: 18mm 18mm 20mm; }
  * { box-sizing: border-box; }
  body { font: 10.5pt/1.55 -apple-system, "Helvetica Neue", Arial, sans-serif; color: #1f2333; margin: 0; }
  header { border-top: 6px solid #f29a2e; padding-top: 10px; display: flex; justify-content: space-between; align-items: baseline; }
  .brand { font-weight: 800; color: #1e2470; font-size: 12pt; letter-spacing: -0.01em; }
  .kicker { font-size: 8pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9a5a00; }
  h1 { color: #1e2470; font-size: 21pt; line-height: 1.15; margin: 18px 0 6px; letter-spacing: -0.01em; }
  .meta { color: #5a5f73; font-size: 9pt; margin: 0 0 14px; padding-bottom: 12px; border-bottom: 1.5px solid #1e2470; }
  .summary { font-size: 11.5pt; color: #3a3f52; }
  h2 { color: #1e2470; font-size: 13pt; margin: 20px 0 6px; padding-top: 8px; border-top: 1px solid #d9dbe5; break-after: avoid; }
  ul, ol { padding-left: 20px; margin: 6px 0; }
  li { margin: 4px 0; break-inside: avoid; }
  footer { margin-top: 26px; padding-top: 8px; border-top: 1px solid #d9dbe5; font-size: 8pt; color: #5a5f73; }
</style></head>
<body>
  <header><span class="brand">VidyantIAS</span><span class="kicker">Notes · ${escape(subject.title)}</span></header>
  <h1>${escape(note.title)}</h1>
  <p class="meta">${note.stages.join(" · ")} · Revised ${revised}</p>
  <p class="summary">${escape(note.summary)}</p>
  ${bodyHtml(body)}
  <footer>VidyantIAS, Pune · Free to keep, print and share.</footer>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), "vi-note-"));
const htmlPath = join(dir, "note.html");
const pdfPath = join(dir, `${note.slug.current}.pdf`);
writeFileSync(htmlPath, html);

const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, [
  "--headless", "--disable-gpu", "--no-pdf-header-footer",
  `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href,
], { stdio: "ignore" });

const pdf = readFileSync(pdfPath);
const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length || undefined;
console.log(`PDF: ${pdfPath} · ${pages ?? "?"} pages · ${Math.round(pdf.length / 1024)} KB`);

if (flags.dryRun) {
  console.log(`Would upload it and ${flags.replace ? "replace" : "create or update"}: ${note._id}`);
  process.exit(0);
}

// ── Upload and attach ───────────────────────────────────────────────────────

const asset = await client.assets.upload("file", pdf, {
  filename: `${note.slug.current}.pdf`,
  contentType: "application/pdf",
});
const file = { _type: "file", asset: { _type: "reference", _ref: asset._id } };

const published = await client.getDocument(PUBLISHED_ID);
if (published && !flags.replace) {
  // Already live: swap in the new PDF; drop the old on-page text fields.
  await client
    .patch(PUBLISHED_ID)
    .set({ file, ...(pages ? { pages } : {}) })
    .unset(["content", "readingMinutes"])
    .commit();
  console.log(`Published note updated with its PDF: ${PUBLISHED_ID}`);
  process.exit(0);
}

const doc = { ...note, file, ...(pages ? { pages } : {}) };
const result = flags.replace ? await client.createOrReplace(doc) : await client.createIfNotExists(doc);
console.log(`Draft ready: ${result._id} — "${note.title}" · ${subject.title}`);
console.log("Open Studio → Notes → English to review and publish.");
