# Sanity CMS

Editorial content only: blog, current affairs, faculty bios, course marketing
copy, demo classes, free resources, FAQs, announcements.

## 1. Create the project

```bash
npx sanity@latest login
npx sanity@latest init --env
```

Choose **"Create new project"**, name it `vidyantIAS`, dataset `production`,
and when asked about a project template pick **"Clean project"** — the schemas
are already in this repo at `sanity/schemas/`.

`--env` writes the project id into `.env.local`. Confirm it matches:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2026-01-01"
```

Project id and dataset are public — they appear in every CDN request the browser
makes. The API version is pinned to a date rather than `vX` so that a Sanity API
change cannot alter what a published GROQ query returns.

## 2. Allow the studio to load

[sanity.io/manage](https://www.sanity.io/manage) → your project → **API** →
**CORS origins**. Add, each with credentials allowed:

- `http://localhost:3000`
- `https://www.vidyantias.com`
- the Vercel preview domain

Without this the studio loads and then fails to log in with a CORS error.

## 3. Open the studio

`npm run dev`, then <http://localhost:3000/studio>.

The studio is mounted inside this app (`src/app/studio/[[...tool]]/`), so there
is one deploy and one domain. Access is the Sanity project's member list, not
Firebase roles — invite editors under **Members** in sanity.io/manage.

> The page renders a "Studio not configured" notice rather than crashing when
> `NEXT_PUBLIC_SANITY_PROJECT_ID` is unset, which is the repo's state until the
> steps above are done.

## 4. Tokens

Two server-only secrets, neither required for public reads:

```bash
# Viewer token — draft previews. API → Tokens → Add token, role "Viewer".
SANITY_API_READ_TOKEN=

# Webhook secret — cache revalidation. openssl rand -base64 32
SANITY_REVALIDATE_SECRET=
```

Never give either a `NEXT_PUBLIC_` prefix. A write token is not needed by this
application at all: the app only reads from Sanity.

## 5. The publish webhook

Without it, a published article waits out the revalidate window (10 minutes for
current affairs, an hour for everything else). With it, it is live in a second.

sanity.io/manage → **API** → **Webhooks** → Create webhook:

| Field | Value |
| --- | --- |
| URL | `https://www.vidyantias.com/api/revalidate/sanity` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["blog","currentAffair","faculty","course","demoClass","freeResource","faq","announcement","category","subject","tag","author","translation.metadata"]` |
| Projection | `{_type, "slug": slug.current}` |
| HTTP method | POST |
| API version | `v2021-03-25` |
| Secret | the value of `SANITY_REVALIDATE_SECRET` |

The route verifies the signature and then invalidates only the tags that
changed — publishing one blog post does not re-render the faculty page. A
taxonomy rename is the exception: it changes titles inside every projection that
dereferences it, so it invalidates everything.

## The schema

```
sanity/
├── schemas/
│   ├── index.ts            the schema array
│   ├── blog.ts             title, slug, excerpt, cover, author, categories, tags, content, publishedAt, seo
│   ├── currentAffair.ts    title, slug, date, category, importance, summary, content, sources, relatedSubjects, seo
│   ├── faculty.ts          name, slug, designation, photo, subjects, experience, bio, achievements, order
│   ├── course.ts           marketing copy only — fees and access live in Firestore
│   ├── demoClass.ts        free/public recordings and live sessions
│   ├── freeResource.ts     downloadable PDFs
│   ├── faq.ts              question, answer, category, order
│   ├── announcement.ts     site banner, windowed by startsAt/endsAt
│   ├── taxonomy.ts         category, subject, tag, author
│   └── objects.ts          blockContent, seo, source, curriculumModule
├── structure.ts            studio navigation
└── ../sanity.config.ts     at the repo root, where the Sanity CLI expects it
```

Taxonomies are documents, not free-text strings, so renaming "Polity" to
"Polity & Governance" updates every article at once instead of leaving two
spellings in the filters forever.

### Joining to Firestore

`faculty.slug` ↔ `faculty/{uid}.sanitySlug` and `course.slug` ↔
`courses/{courseId}.sanitySlug`. Set both sides when creating a pair, or the
public page and the operational record will not find each other.

#### Courses

`src/lib/courses/catalogue.ts` builds the public catalogue from both halves:

| Firestore `courses/{courseId}` (admin panel) | Sanity `course` (Studio) |
| --- | --- |
| whether it is listed (`status: published`) | title, summary, description |
| category — drives the `/courses` filter | highlights, audience, outcomes |
| delivery modes, duration in months | curriculum, tests, mentorship, study material |
| price (null → "shared during counselling") | schedule, duration text, faculty, sort order |

A course is listed only when the Firestore record is published **and** a Sanity
document's slug equals its `sanitySlug`. To add one: create it in the admin
panel with **Sanity slug** filled in, then publish a Course (content) document
with that slug in the Studio. Admin edits show within seconds (the actions
revalidate the `firestore:courses` tag); Studio edits arrive through the
webhook below, or within the hour.

The launch catalogue is seeded by two idempotent scripts reading
`scripts/seed/courses.mjs`:

```bash
npm run seed:courses:firestore   # creates missing records, links existing ones
npx sanity login                 # once
npm run seed:courses:sanity      # creates missing documents (--replace to overwrite)
```

#### Everything else

FAQs, free resources, blog posts, current affairs and announcements are read
from Sanity through `src/lib/content/site.ts`, which maps them onto the
`@/types` shapes the components already use. `src/data/` keeps only page copy
(labels, empty-state text) and the content with no Sanity schema yet: faculty
placeholders, events, quizzes, results, testimonials and batches.

```bash
npm run seed:content:sanity      # FAQs + resources (migrated), taxonomy, sample posts,
                                 # current affairs and an announcement
```

The samples are real content, published: evergreen blog posts, current-affairs
analyses of dated developments with official sources, and an undated
announcement. Edit or unpublish them in the Studio like any other document.

> Without the webhook (§5), a published change can take up to an hour to show,
> and `next dev` keeps the stale result in memory until it restarts.

## Translations

English and Hindi, configured from `src/i18n/config.ts`. Two strategies:

- **Document per language** — blog, current affairs, announcements, faculty,
  courses, demo classes, free resources, FAQs. Each list in the Studio splits
  into *All / English / Hindi*. Open an English document, use the
  **Translations** menu to create the Hindi version, translate it, publish.
  Translations keep the English slug, so `/blog/x` and `/hi/blog/x` are the
  same article. The `@sanity/document-internationalization` plugin links them
  through a `translation.metadata` document.
- **Field per language** — categories, subjects, tags (`titleI18n.hi`) and the
  author designation (`designationI18n.hi`). Fill the Hindi field in the
  collapsed *translations* group under the English one.

Untranslated content falls back to English on the Hindi site: a list shows the
English document until a Hindi translation is **published**, and an empty Hindi
label shows the English one. Documents from before localisation have no
`language` field and count as English.

## What must never go in Sanity

A Sanity dataset is world-readable by default and has no per-user authorisation.
So, never:

- student records, enrollments, test attempts, answers, results
- payments or fee status
- authentication or roles
- paid lecture video ids (`demoClass.muxPlaybackId` is for *public* recordings
  only — a signed-playback id for a paid lecture belongs on
  `lessons/{lessonId}.muxAssetId` in Firestore)
- question banks with answer keys

If a document decides who may see or do something, it is application data.

## Reading from Sanity

Every query is in `src/lib/sanity/queries.ts`; nothing queries Sanity from a
component.

```ts
import { getLatestBlogs, getCurrentAffairs, getFaculty } from "@/lib/sanity/queries";

const posts = await getLatestBlogs(6);   // [] when Sanity is unreachable
```

All of them return `[]` or `null` on failure rather than throwing, so a CMS
outage degrades a section instead of taking down the page — and so a caller can
keep falling back to the existing `src/data/*` content.

Images go through `src/lib/sanity/image.ts`, never `asset.url`: the raw asset URL
is the original upload, so a 4 MB editorial photograph would be served untouched
to a phone.

## Migrating the existing content

`src/data/*.ts` currently holds typed content files. They keep working — nothing
has been pointed at Sanity yet. Migrate one type at a time:

1. Create the documents in the studio.
2. Swap the component's import from `@/data/blog` to
   `getLatestBlogs()` from `@/lib/sanity/queries`.
3. Keep the `src/data` file until the Sanity content is verified in production.

Start with `blog` and `current-affairs` — both ship empty today, so there is
nothing to lose.

## Generated types

`src/lib/sanity/types.ts` is hand-written to match each query's projection. Once
the schemas settle, replace it:

```bash
npx sanity@latest schema extract
npx sanity@latest typegen generate
```

That reads `sanity.config.ts` at the repo root and emits `sanity.types.ts`.
