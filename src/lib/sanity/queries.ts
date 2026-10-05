import { defineQuery } from "next-sanity";

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
 */

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
  *[_type == "blog" && defined(slug.current) && !(_id in path("drafts.**"))]
    | order(publishedAt desc)[0...$limit] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage${IMAGE},
      "categories": categories[]->title,
      publishedAt,
      readingMinutes,
      "authorName": author->name
    }
`);

export async function getLatestBlogs(limit = 6): Promise<BlogListItem[]> {
  const result = await sanityFetch<BlogListItem[]>(
    latestBlogsQuery,
    { limit },
    { tags: [SANITY_TAGS.blog] },
  );

  return result ?? [];
}

const blogPostQuery = defineQuery(`
  *[_type == "blog" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage${IMAGE},
    "categories": categories[]->title,
    "tags": tags[]->title,
    publishedAt,
    readingMinutes,
    content,
    "authorName": author->name,
    "authorRole": author->designation,
    "authorImage": author->photo${IMAGE},
    "seo": ${SEO}
  }
`);

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return sanityFetch<BlogPost>(
    blogPostQuery,
    { slug },
    { tags: [SANITY_TAG.blogPost(slug)] },
  );
}

/** Slugs for `generateStaticParams`. */
const blogSlugsQuery = defineQuery(`
  *[_type == "blog" && defined(slug.current) && !(_id in path("drafts.**"))].slug.current
`);

export async function getBlogSlugs(): Promise<string[]> {
  return (await sanityFetch<string[]>(blogSlugsQuery, {}, { tags: [SANITY_TAGS.blog] })) ?? [];
}

const currentAffairsQuery = defineQuery(`
  *[_type == "currentAffair" && !(_id in path("drafts.**"))]
    | order(date desc)[0...$limit] {
      _id,
      title,
      "slug": slug.current,
      date,
      "category": category->title,
      importance,
      "relatedSubjects": relatedSubjects[]->title,
      summary
    }
`);

export async function getCurrentAffairs(limit = 20): Promise<CurrentAffairListItem[]> {
  const result = await sanityFetch<CurrentAffairListItem[]>(
    currentAffairsQuery,
    { limit },
    { tags: [SANITY_TAGS.currentAffairs] },
  );

  return result ?? [];
}

const currentAffairQuery = defineQuery(`
  *[_type == "currentAffair" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    "slug": slug.current,
    date,
    "category": category->title,
    importance,
    "relatedSubjects": relatedSubjects[]->title,
    summary,
    content,
    sources[]{ label, url },
    "tags": tags[]->title,
    "seo": ${SEO}
  }
`);

export async function getCurrentAffair(slug: string): Promise<CurrentAffair | null> {
  return sanityFetch<CurrentAffair>(
    currentAffairQuery,
    { slug },
    { tags: [SANITY_TAG.currentAffair(slug)] },
  );
}

const facultyQuery = defineQuery(`
  *[_type == "faculty" && !(_id in path("drafts.**"))] | order(order asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    designation,
    photo${IMAGE},
    bio,
    "subjects": subjects[]->title,
    "papers": subjects[]->paper,
    experience,
    achievements,
    "order": coalesce(order, 99)
  }
`);

export async function getFaculty(): Promise<FacultyMember[]> {
  return (await sanityFetch<FacultyMember[]>(facultyQuery, {}, { tags: [SANITY_TAGS.faculty] })) ?? [];
}

const coursesQuery = defineQuery(`
  *[_type == "course" && !(_id in path("drafts.**"))] | order(order asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    "category": category->title,
    summary,
    heroImage${IMAGE},
    highlights,
    curriculum[]{ title, topics },
    body,
    "seo": ${SEO}
  }
`);

/** Marketing content for the course pages. Pricing and access live in Firestore. */
export async function getCourses(): Promise<CourseContent[]> {
  return (await sanityFetch<CourseContent[]>(coursesQuery, {}, { tags: [SANITY_TAGS.courses] })) ?? [];
}

const courseQuery = defineQuery(`
  *[_type == "course" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    "slug": slug.current,
    "category": category->title,
    summary,
    heroImage${IMAGE},
    highlights,
    curriculum[]{ title, topics },
    body,
    "seo": ${SEO}
  }
`);

export async function getCourseContent(slug: string): Promise<CourseContent | null> {
  return sanityFetch<CourseContent>(courseQuery, { slug }, { tags: [SANITY_TAGS.courses] });
}

const demoClassesQuery = defineQuery(`
  *[_type == "demoClass" && !(_id in path("drafts.**"))] | order(scheduledFor desc) {
    _id,
    title,
    "slug": slug.current,
    "subject": subject->title,
    "facultyName": faculty->name,
    scheduledFor,
    durationMinutes,
    muxPlaybackId,
    description
  }
`);

export async function getDemoClasses(): Promise<DemoClass[]> {
  return (await sanityFetch<DemoClass[]>(demoClassesQuery, {}, { tags: [SANITY_TAGS.demoClasses] })) ?? [];
}

const freeResourcesQuery = defineQuery(`
  *[_type == "freeResource" && !(_id in path("drafts.**"))] | order(order asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    "category": category->title,
    description,
    "fileUrl": file.asset->url,
    pages
  }
`);

export async function getFreeResources(): Promise<FreeResource[]> {
  return (await sanityFetch<FreeResource[]>(freeResourcesQuery, {}, { tags: [SANITY_TAGS.freeResources] })) ?? [];
}

const faqsQuery = defineQuery(`
  *[_type == "faq" && !(_id in path("drafts.**"))] | order(order asc) {
    _id,
    question,
    answer,
    "category": coalesce(category->title, "General"),
    "order": coalesce(order, 99)
  }
`);

export async function getFaqs(): Promise<Faq[]> {
  return (await sanityFetch<Faq[]>(faqsQuery, {}, { tags: [SANITY_TAGS.faqs] })) ?? [];
}

const announcementsQuery = defineQuery(`
  *[_type == "announcement"
    && !(_id in path("drafts.**"))
    && startsAt <= $now
    && (!defined(endsAt) || endsAt >= $now)] | order(startsAt desc) {
      _id, title, body, tone, href, startsAt, endsAt
    }
`);

/** Site-wide banners. Short revalidate: an announcement is time-sensitive. */
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const result = await sanityFetch<Announcement[]>(
    announcementsQuery,
    { now: new Date().toISOString() },
    { revalidate: SANITY_REVALIDATE.daily, tags: [SANITY_TAGS.announcements] },
  );

  return result ?? [];
}
