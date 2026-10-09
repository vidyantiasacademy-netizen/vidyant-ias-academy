/**
 * Seeds the Sanity `course` documents that carry each course's public copy.
 *
 *   npx sanity login                     # once
 *   npm run seed:courses:sanity          # = sanity exec … --with-user-token
 *
 * or, without a CLI login, with an Editor token that is never committed:
 *
 *   SANITY_API_WRITE_TOKEN=… node scripts/seed-courses-sanity.mjs
 *
 * Document ids are deterministic (`course-<slug>`), so a re-run updates the
 * same documents instead of duplicating them. `createIfNotExists` is the
 * default: copy an editor has since changed in the Studio is left alone. Pass
 * `--replace` to overwrite it with the seed copy.
 */
import { SEED_COURSES } from "./seed/courses.mjs";
import { blocks, commitAll, sanityFlags, seedClient } from "./seed/sanity.mjs";

const flags = sanityFlags();
const client = seedClient(flags);

function toDocument({ firestore, sanity }) {
  const document = {
    _id: `course-${firestore.slug}`,
    _type: "course",
    language: "en",
    title: sanity.title,
    slug: { _type: "slug", current: firestore.slug },
    summary: sanity.summary,
    body: blocks(sanity.body),
    highlights: sanity.highlights,
    audience: sanity.audience,
    outcomes: sanity.outcomes,
    curriculum: sanity.curriculum.map((module, index) => ({
      _type: "curriculumModule",
      _key: `m${index}`,
      title: module.title,
      topics: module.topics,
    })),
    schedule: sanity.schedule,
    tests: sanity.tests,
    mentorship: sanity.mentorship,
    studyMaterial: sanity.studyMaterial,
    order: sanity.order,
  };

  if (sanity.durationNote) document.durationNote = sanity.durationNote;

  return document;
}

await commitAll(client, SEED_COURSES.map(toDocument), flags);
