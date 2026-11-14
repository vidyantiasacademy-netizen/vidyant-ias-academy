/**
 * Seeds one sample free note (`studyNote`) so editors can see the shape of a
 * finished note in the Studio before writing their own.
 *
 * Created as a DRAFT: it shows in Studio → Free notes but not on the site
 * until an editor reviews and publishes it. The content is factual (Part III
 * of the Constitution) so publishing it is safe, but it is the faculty's call.
 *
 *   npm run seed:notes:sanity
 *   npm run seed:notes:sanity -- --replace   # overwrite the draft
 *   npm run seed:notes:sanity -- --dry-run
 *   npm run seed:notes:sanity -- --publish   # publish the draft (makes it public)
 *
 * Deterministic id + `createIfNotExists`, so Studio edits survive a re-run.
 */
import { blocks, sanityFlags, seedClient, wordCount } from "./seed/sanity.mjs";

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
  content: blocks(body),
  readingMinutes: Math.max(1, Math.round(wordCount(body) / 200)),
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

if (flags.dryRun) {
  console.log(`Would ${flags.replace ? "replace" : "create if missing"}: ${note._id}`);
  console.log(`  "${note.title}" · ${subject.title} · ${note.content.length} blocks · ${note.readingMinutes} min read`);
  process.exit(0);
}

const result = flags.replace
  ? await client.createOrReplace(note)
  : await client.createIfNotExists(note);

console.log(`Draft ready: ${result._id}`);
console.log(`  "${note.title}" · ${subject.title} · ${note.readingMinutes} min read`);
console.log("Open Studio → Free notes → English to review and publish.");
