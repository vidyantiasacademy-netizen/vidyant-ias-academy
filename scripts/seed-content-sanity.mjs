/**
 * Seeds Sanity with everything the public site reads besides courses:
 * FAQs and free resources (migrated verbatim from `src/data/*`), the taxonomy
 * and author they need, and sample blog posts, current-affairs analyses, an
 * announcement and faculty role cards (`scripts/seed/samples.mjs`).
 *
 * Sample faculty are linked from the course documents that
 * `seed:courses:sanity` creates, so run that first. Courses that do not exist
 * yet are skipped, and a course whose faculty list an editor has already set
 * is left alone unless `--replace` is passed.
 *
 *   npm run seed:content:sanity                  # create missing documents
 *   npm run seed:content:sanity -- --replace     # overwrite with the seed copy
 *   npm run seed:content:sanity -- --dry-run
 *
 * Same credentials and idempotency as `seed-courses-sanity.mjs`: deterministic
 * ids, `createIfNotExists` by default, so Studio edits survive a re-run.
 */
import { SEED_FAQS, SEED_RESOURCES } from "./seed/migrated.mjs";
import {
  SEED_ANNOUNCEMENTS,
  SEED_AUTHOR,
  SEED_CATEGORIES,
  SEED_CURRENT_AFFAIRS,
  SEED_FACULTY,
  SEED_POSTS,
  SEED_SUBJECTS,
} from "./seed/samples.mjs";
import { blocks, commitAll, sanityFlags, seedClient, wordCount } from "./seed/sanity.mjs";

const flags = sanityFlags();
const client = seedClient(flags);

const ref = (id, key) => ({ _type: "reference", _ref: id, ...(key ? { _key: key } : {}) });
const slug = (current) => ({ _type: "slug", current });

/** Spread publish times an hour apart so "newest first" has a stable order. */
const now = Date.now();
const hoursAgo = (hours) => new Date(now - hours * 3_600_000).toISOString();

const documents = [
  ...SEED_CATEGORIES.map((category) => ({
    _id: category.id,
    _type: "category",
    title: category.title,
    slug: slug(category.slug),
    order: category.order,
  })),

  ...SEED_SUBJECTS.map((subject) => ({
    _id: subject.id,
    _type: "subject",
    title: subject.title,
    slug: slug(subject.slug),
    paper: subject.paper,
  })),

  {
    _id: SEED_AUTHOR.id,
    _type: "author",
    name: SEED_AUTHOR.name,
    slug: slug(SEED_AUTHOR.slug),
    designation: SEED_AUTHOR.designation,
  },

  ...SEED_FAQS.map((faq) => ({
    _id: faq.id,
    _type: "faq",
    language: "en",
    question: faq.question,
    answer: blocks(faq.answer),
    topics: faq.topics,
    featured: faq.featured,
    order: faq.order,
  })),

  ...SEED_RESOURCES.map((resource) => ({
    _id: resource.id,
    _type: "freeResource",
    language: "en",
    title: resource.title,
    slug: slug(resource.slug),
    description: resource.description,
    resourceType: resource.resourceType,
    tracks: resource.tracks,
    requiresLead: resource.requiresLead,
    order: resource.order,
  })),

  ...SEED_POSTS.map((post, index) => ({
    _id: `blog-${post.slug}`,
    _type: "blog",
    language: "en",
    title: post.title,
    slug: slug(post.slug),
    excerpt: post.excerpt,
    author: ref(SEED_AUTHOR.id),
    categories: post.categories.map((id, i) => ref(id, `c${i}`)),
    content: blocks(post.body),
    readingMinutes: Math.max(1, Math.ceil(wordCount(post.body) / 200)),
    publishedAt: hoursAgo(index),
  })),

  ...SEED_CURRENT_AFFAIRS.map((item) => ({
    _id: `currentAffair-${item.slug}`,
    _type: "currentAffair",
    language: "en",
    title: item.title,
    slug: slug(item.slug),
    date: item.date,
    category: ref(item.category),
    importance: item.importance,
    relevance: item.relevance,
    summary: item.summary,
    content: blocks(item.body),
    sources: item.sources.map((source, i) => ({ _type: "source", _key: `s${i}`, ...source })),
  })),

  ...SEED_ANNOUNCEMENTS.map((notice) => ({
    _id: notice.id,
    _type: "announcement",
    language: "en",
    title: notice.title,
    body: notice.body,
    tone: notice.tone,
    href: notice.href,
    startsAt: new Date(now).toISOString(),
  })),

  ...SEED_FACULTY.map((member) => ({
    _id: `faculty-${member.slug}`,
    _type: "faculty",
    language: "en",
    name: member.name,
    slug: slug(member.slug),
    designation: member.designation,
    subjects: member.subjects.map((id, i) => ref(id, `s${i}`)),
    bio: blocks(member.bio),
    teachingPhilosophy: member.teachingPhilosophy,
    profilePending: true,
    order: member.order,
  })),
];

await commitAll(client, documents, flags);

/** course slug → the sample faculty who teach it, in roster order. */
const facultyByCourse = new Map();

for (const member of SEED_FACULTY) {
  for (const course of member.courses) {
    facultyByCourse.set(course, [...(facultyByCourse.get(course) ?? []), `faculty-${member.slug}`]);
  }
}

const courseIds = [...facultyByCourse.keys()].map((course) => `course-${course}`);
const existing = new Set(await client.fetch(`*[_id in $ids]._id`, { ids: courseIds }));

console.log("\nCourse → faculty links:");

const links = client.transaction();
let linked = 0;

for (const [course, facultyIds] of facultyByCourse) {
  const id = `course-${course}`;

  if (!existing.has(id)) {
    console.log(`  skip (no course document)  ${id}`);
    continue;
  }

  const faculty = facultyIds.map((facultyId, i) => ref(facultyId, `f${i}`));
  console.log(`  ${flags.replace ? "set" : "set-if-missing"}  ${id}.faculty (${faculty.length})`);
  links.patch(id, (patch) => (flags.replace ? patch.set({ faculty }) : patch.setIfMissing({ faculty })));
  linked += 1;
}

if (!flags.dryRun && linked > 0) {
  await links.commit({ visibility: "async" });
  console.log(`\nLinked faculty on ${linked} courses.`);
}
