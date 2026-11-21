/**
 * Applies the institute's programme-card data (`./seed/course-cards.mjs`) to
 * the Sanity `course` documents.
 *
 *   npm run seed:course-cards:sanity              # write
 *   npm run seed:course-cards:sanity -- --dry-run # print, write nothing
 *
 * For a course whose Sanity document exists: sets its title, sort order,
 * `card` lines and highlights. For one that has only a Firestore record (no
 * Sanity document, so the site cannot list it): creates the document from
 * the entry's `create` copy. Ids are `course-<slug>`, as `seed:courses:sanity`
 * uses, so the two scripts never duplicate a course.
 */
import { COURSE_CARDS } from "./seed/course-cards.mjs";
import { blocks, sanityFlags, seedClient } from "./seed/sanity.mjs";

const flags = sanityFlags();
const client = seedClient(flags);

const slugs = Object.keys(COURSE_CARDS);
const existing = await client.fetch(
  `*[_type == "course" && slug.current in $slugs && !(_id in path("drafts.**"))]{ _id, "slug": slug.current }`,
  { slugs },
);
const idBySlug = new Map(existing.map((doc) => [doc.slug, doc._id]));

const transaction = client.transaction();

for (const [slug, entry] of Object.entries(COURSE_CARDS)) {
  const card = { _type: "object", ...entry.card };
  const id = idBySlug.get(slug);

  if (id) {
    console.log(`  update  ${id} — ${entry.title}`);
    transaction.patch(id, (patch) =>
      patch.set({ title: entry.title, order: entry.order, card, highlights: entry.highlights }),
    );
    continue;
  }

  if (!entry.create) {
    console.log(`  skip    ${slug} — no Sanity document and no copy to create one`);
    continue;
  }

  console.log(`  create  course-${slug} — ${entry.title}`);
  transaction.createIfNotExists({
    _id: `course-${slug}`,
    _type: "course",
    language: "en",
    title: entry.title,
    slug: { _type: "slug", current: slug },
    summary: entry.create.summary,
    body: blocks(entry.create.body),
    card,
    highlights: entry.highlights,
    audience: [],
    outcomes: [],
    curriculum: [],
    studyMaterial: [],
    ...(entry.create.durationNote ? { durationNote: entry.create.durationNote } : {}),
    ...(entry.create.mentorship ? { mentorship: entry.create.mentorship } : {}),
    order: entry.order,
  });
}

if (flags.dryRun) {
  console.log("\nDry run — nothing written.");
} else {
  await transaction.commit({ visibility: "sync" });
  console.log("\nDone.");
}
