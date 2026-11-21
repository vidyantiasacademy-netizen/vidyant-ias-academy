/**
 * Publishes the academic team's blog articles (`scripts/seed/blog-posts.mjs`)
 * to Sanity, bylined to the academic-team author.
 *
 *   npm run seed:blog:sanity                  # create missing posts
 *   npm run seed:blog:sanity -- --replace     # overwrite with the seed copy
 *   npm run seed:blog:sanity -- --dry-run
 *
 * Deterministic ids (`blog-<slug>`) and `createIfNotExists` by default, so
 * Studio edits survive a re-run. Needs the author and categories that
 * `seed:content:sanity` creates.
 */
import { BLOG_POSTS } from "./seed/blog-posts.mjs";
import { SEED_AUTHOR } from "./seed/samples.mjs";
import { blocks, commitAll, sanityFlags, seedClient } from "./seed/sanity.mjs";

const flags = sanityFlags();
const client = seedClient(flags);

const ref = (id, key) => ({ _type: "reference", _ref: id, ...(key ? { _key: key } : {}) });

const needed = [SEED_AUTHOR.id, ...new Set(BLOG_POSTS.flatMap((post) => post.categories))];
const present = new Set(await client.fetch(`*[_id in $ids]._id`, { ids: needed }));
const missing = needed.filter((id) => !present.has(id));

if (missing.length > 0) {
  console.error(`Missing in the dataset: ${missing.join(", ")}. Run seed:content:sanity first.`);
  process.exit(1);
}

/** First post newest; a minute apart so "newest first" keeps the listed order. */
const now = Date.now();

const documents = BLOG_POSTS.map((post, index) => ({
  _id: `blog-${post.slug}`,
  _type: "blog",
  language: "en",
  title: post.title,
  slug: { _type: "slug", current: post.slug },
  excerpt: post.excerpt,
  author: ref(SEED_AUTHOR.id),
  categories: post.categories.map((id, i) => ref(id, `c${i}`)),
  content: blocks(post.body),
  readingMinutes: post.readingMinutes,
  publishedAt: new Date(now - index * 60_000).toISOString(),
}));

await commitAll(client, documents, flags);
