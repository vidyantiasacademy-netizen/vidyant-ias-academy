import { defineQuery } from "next-sanity";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";

import { sanityFetch } from "./client";
import { SANITY_REVALIDATE } from "./env";
import type {
  Announcement,
  BlogListItem,
  BlogPost,
  CourseContent,
  CurrentAffair,
  CurrentAffairListItem,
  DemoClass,
  Faq,
  FacultyMember,
  FreeResource,
} from "./types";

/**
 * Every GROQ query in the application.
 *
 * Centralised for three reasons: a projection change happens in one place
 * rather than in six components; cache tags stay consistent, so the Sanity
 * webhook in `app/api/revalidate/sanity` can invalidate precisely what changed;
 * and the returned shapes stay in step with `types.ts`.
 *
 * Each function returns an empty array / `null` when Sanity is not configured or
 * is unreachable, so a caller can render the existing `src/data/*` content or an
 * empty state without a try/catch.
 *
 * Every function takes the locale to read. Content is translated per document
 * (see `sanity/schemas/i18n.ts`), and a reader always gets something: the
 * document in their language, or the English one when it has no translation
 * yet. Taxonomy labels fall back the same way, field by field.
 */

/** Parameters every localised query reads. */
function localeParams(locale: Locale) {
  return { lang: locale, defaultLocale: DEFAULT_LOCALE };
}

/**
 * List filter: documents in `$lang`, plus default-locale documents that have no
 * *published* translation into `$lang`. A document without a `language` field
 * predates localisation and counts as the default locale.
 *
 * The translation check goes through the plugin's `translation.metadata`
 * document rather than matching slugs, so it also works for types without one
 * (FAQs, announcements). `defined(value->_id)` skips a translation that exists
 * only as a draft — the published perspective cannot see it, so the English
 * version must stay.
 */
const IN_LOCALE = `(
  coalesce(language, $defaultLocale) == $lang
  || (
    coalesce(language, $defaultLocale) == $defaultLocale
    && count(*[_type == "translation.metadata" && references(^._id)]
      .translations[language == $lang && defined(value->_id)]) == 0
  )
)`;

/**
 * Single-document filter + ordering by slug: translations share the slug, so
 * take the `$lang` version when there is one and the default-locale one
 * otherwise. Append `[0]` after it.
 */
const BY_SLUG_IN_LOCALE = `slug.current == $slug
    && coalesce(language, $defaultLocale) in [$lang, $defaultLocale]]
    | order(select(coalesce(language, $defaultLocale) == $lang => 0, 1))`;

/**
 * A field-level translated string (`title` + `titleI18n.hi`), in `$lang` with
 * the English value as fallback. Built from `LOCALES` because GROQ cannot index
 * an object by a parameter.
 */
function localized(field: string) {
  const branches = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)
    .map((locale) => `$lang == "${locale}" => ${field}I18n.${locale}`)
    .join(", ");

  return `coalesce(select(${branches}), ${field})`;
}

/** A dereferenced taxonomy label: `label("category")`, `label("tags[]")`. */
function label(reference: string, field = "title") {
  return `${reference}->{ "value": ${localized(field)} }.value`;
}

/** Reused image projection — includes the LQIP for `next/image` blur. */
const IMAGE = `{
  "url": asset->url,
  "ref": asset._ref,
  "alt": coalesce(alt, ""),
  "lqip": asset->metadata.lqip,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`;

const SEO = `{
  "title": coalesce(seo.title, title),
  "description": seo.description,
  "image": seo.image${IMAGE},
  "noIndex": coalesce(seo.noIndex, false)
}`;

/**
 * Cache tags, one per document type. Kept as plain strings (the per-slug
 * builders live in `SANITY_TAG` below) so the revalidation webhook can treat
 * `Object.values(SANITY_TAGS)` as the complete list of tags to invalidate.
 */
export const SANITY_TAGS = {
  blog: "sanity:blog",
  currentAffairs: "sanity:currentAffair",
  faculty: "sanity:faculty",
  courses: "sanity:course",
  demoClasses: "sanity:demoClass",
  freeResources: "sanity:freeResource",
  faqs: "sanity:faq",
  announcements: "sanity:announcement",
} as const;

/** Per-document tags, so publishing one article invalidates only its page. */
export const SANITY_TAG = {
  blogPost: (slug: string) => `sanity:blog:${slug}`,
  currentAffair: (slug: string) => `sanity:currentAffair:${slug}`,
} as const;

const latestBlogsQuery = defineQuery(`
  *[_type == "blog" && defined(slug.current) && !(_id in path("drafts.**")) && ${IN_LOCALE}]
    | order(publishedAt desc)[0...$limit] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage${IMAGE},
      "categories": ${label("categories[]")},
      publishedAt,
      readingMinutes,
      "authorName": author->name
    }
`);

export async function getLatestBlogs(
  limit = 6,
  locale: Locale = DEFAULT_LOCALE,
): Promise<BlogListItem[]> {
  const result = await sanityFetch<BlogListItem[]>(
    latestBlogsQuery,
    { limit, ...localeParams(locale) },
    { tags: [SANITY_TAGS.blog] },
  );

  return result ?? [];
}

const blogPostQuery = defineQuery(`
  *[_type == "blog" && !(_id in path("drafts.**")) && ${BY_SLUG_IN_LOCALE}[0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage${IMAGE},
    "categories": ${label("categories[]")},
    "tags": ${label("tags[]")},
    publishedAt,
    readingMinutes,
    content,
    "authorName": author->name,
    "authorRole": ${label("author", "designation")},
    "authorImage": author->photo${IMAGE},
    "seo": ${SEO}
  }
`);

export async function getBlogPost(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<BlogPost | null> {
  return sanityFetch<BlogPost>(
    blogPostQuery,
    { slug, ...localeParams(locale) },
    { tags: [SANITY_TAG.blogPost(slug)] },
  );
}

/**
 * Slugs for `generateStaticParams`. Every language, deduplicated: translations
 * share the slug, and the page itself picks the version for its locale.
 */
const blogSlugsQuery = defineQuery(`
  array::unique(*[_type == "blog" && defined(slug.current) && !(_id in path("drafts.**"))].slug.current)
`);

export async function getBlogSlugs(): Promise<string[]> {
  return (await sanityFetch<string[]>(blogSlugsQuery, {}, { tags: [SANITY_TAGS.blog] })) ?? [];
}

const currentAffairsQuery = defineQuery(`
  *[_type == "currentAffair" && !(_id in path("drafts.**")) && ${IN_LOCALE}]
    | order(date desc)[0...$limit] {
      _id,
      title,
      "slug": slug.current,
      date,
      "category": ${label("category")},
      importance,
      "relatedSubjects": ${label("relatedSubjects[]")},
      "relevance": coalesce(relevance, []),
      summary
    }
`);

export async function getCurrentAffairs(
  limit = 20,
  locale: Locale = DEFAULT_LOCALE,
): Promise<CurrentAffairListItem[]> {
  const result = await sanityFetch<CurrentAffairListItem[]>(
    currentAffairsQuery,
    { limit, ...localeParams(locale) },
    { tags: [SANITY_TAGS.currentAffairs] },
  );

  return result ?? [];
}

const currentAffairQuery = defineQuery(`
  *[_type == "currentAffair" && !(_id in path("drafts.**")) && ${BY_SLUG_IN_LOCALE}[0] {
    _id,
    title,
    "slug": slug.current,
    date,
    "category": ${label("category")},
    importance,
    "relatedSubjects": ${label("relatedSubjects[]")},
    "relevance": coalesce(relevance, []),
    summary,
    content,
    sources[]{ label, url },
    "tags": ${label("tags[]")},
    "seo": ${SEO}
  }
`);

export async function getCurrentAffair(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<CurrentAffair | null> {
  return sanityFetch<CurrentAffair>(
    currentAffairQuery,
    { slug, ...localeParams(locale) },
    { tags: [SANITY_TAG.currentAffair(slug)] },
  );
}

const facultyQuery = defineQuery(`
  *[_type == "faculty" && !(_id in path("drafts.**")) && ${IN_LOCALE}] | order(order asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    designation,
    photo${IMAGE},
    bio,
    "subjects": ${label("subjects[]")},
    "papers": subjects[]->paper,
    experience,
    teachingPhilosophy,
    "profilePending": coalesce(profilePending, false),
    achievements,
    "order": coalesce(order, 99)
  }
`);

export async function getFaculty(locale: Locale = DEFAULT_LOCALE): Promise<FacultyMember[]> {
  return (await sanityFetch<FacultyMember[]>(facultyQuery, localeParams(locale), { tags: [SANITY_TAGS.faculty] })) ?? [];
}

const coursesQuery = defineQuery(`
  *[_type == "course" && defined(slug.current) && !(_id in path("drafts.**")) && ${IN_LOCALE}] | order(order asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    heroImage${IMAGE},
    "highlights": coalesce(highlights, []),
    "audience": coalesce(audience, []),
    "outcomes": coalesce(outcomes, []),
    "curriculum": coalesce(curriculum[]{ title, "topics": coalesce(topics, []) }, []),
    durationNote,
    schedule,
    tests,
    mentorship,
    "studyMaterial": coalesce(studyMaterial, []),
    "facultySlugs": coalesce(faculty[]->slug.current, []),
    body,
    "order": coalesce(order, 99),
    "seo": ${SEO}
  }
`);

/** Marketing content for the course pages. Pricing and access live in Firestore. */
export async function getCourses(locale: Locale = DEFAULT_LOCALE): Promise<CourseContent[]> {
  return (await sanityFetch<CourseContent[]>(coursesQuery, localeParams(locale), { tags: [SANITY_TAGS.courses] })) ?? [];
}

const courseQuery = defineQuery(`
  *[_type == "course" && !(_id in path("drafts.**")) && ${BY_SLUG_IN_LOCALE}[0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    heroImage${IMAGE},
    "highlights": coalesce(highlights, []),
    "audience": coalesce(audience, []),
    "outcomes": coalesce(outcomes, []),
    "curriculum": coalesce(curriculum[]{ title, "topics": coalesce(topics, []) }, []),
    durationNote,
    schedule,
    tests,
    mentorship,
    "studyMaterial": coalesce(studyMaterial, []),
    "facultySlugs": coalesce(faculty[]->slug.current, []),
    body,
    "order": coalesce(order, 99),
    "seo": ${SEO}
  }
`);

export async function getCourseContent(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<CourseContent | null> {
  return sanityFetch<CourseContent>(courseQuery, { slug, ...localeParams(locale) }, { tags: [SANITY_TAGS.courses] });
}

const demoClassesQuery = defineQuery(`
  *[_type == "demoClass" && !(_id in path("drafts.**")) && ${IN_LOCALE}] | order(scheduledFor desc) {
    _id,
    title,
    "slug": slug.current,
    "subject": ${label("subject")},
    "facultyName": faculty->name,
    scheduledFor,
    durationMinutes,
    muxPlaybackId,
    description
  }
`);

export async function getDemoClasses(locale: Locale = DEFAULT_LOCALE): Promise<DemoClass[]> {
  return (await sanityFetch<DemoClass[]>(demoClassesQuery, localeParams(locale), { tags: [SANITY_TAGS.demoClasses] })) ?? [];
}

const freeResourcesQuery = defineQuery(`
  *[_type == "freeResource" && !(_id in path("drafts.**")) && ${IN_LOCALE}] | order(order asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    "category": ${label("category")},
    description,
    "resourceType": coalesce(resourceType, "pdf"),
    "tracks": coalesce(tracks, []),
    "requiresLead": coalesce(requiresLead, false),
    "fileUrl": file.asset->url,
    pages
  }
`);

export async function getFreeResources(locale: Locale = DEFAULT_LOCALE): Promise<FreeResource[]> {
  return (await sanityFetch<FreeResource[]>(freeResourcesQuery, localeParams(locale), { tags: [SANITY_TAGS.freeResources] })) ?? [];
}

const faqsQuery = defineQuery(`
  *[_type == "faq" && !(_id in path("drafts.**")) && ${IN_LOCALE}] | order(order asc) {
    _id,
    question,
    answer,
    "category": coalesce(${label("category")}, "General"),
    "topics": coalesce(topics, []),
    "featured": coalesce(featured, false),
    "order": coalesce(order, 99)
  }
`);

export async function getFaqs(locale: Locale = DEFAULT_LOCALE): Promise<Faq[]> {
  return (await sanityFetch<Faq[]>(faqsQuery, localeParams(locale), { tags: [SANITY_TAGS.faqs] })) ?? [];
}

const announcementsQuery = defineQuery(`
  *[_type == "announcement"
    && !(_id in path("drafts.**"))
    && ${IN_LOCALE}
    && startsAt <= $now
    && (!defined(endsAt) || endsAt >= $now)] | order(startsAt desc) {
      _id, title, body, tone, href, startsAt, endsAt
    }
`);

/** Site-wide banners. Short revalidate: an announcement is time-sensitive. */
export async function getActiveAnnouncements(
  locale: Locale = DEFAULT_LOCALE,
): Promise<Announcement[]> {
  const result = await sanityFetch<Announcement[]>(
    announcementsQuery,
    { now: new Date().toISOString(), ...localeParams(locale) },
    { revalidate: SANITY_REVALIDATE.daily, tags: [SANITY_TAGS.announcements] },
  );

  return result ?? [];
}
