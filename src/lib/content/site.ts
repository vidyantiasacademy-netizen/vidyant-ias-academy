import "server-only";

import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import {
  getActiveAnnouncements,
  getCurrentAffairs,
  getFaqs,
  getFreeResources,
  getLatestBlogs,
} from "@/lib/sanity/queries";
import { ROUTES } from "@/lib/constants/site";
import { plainText } from "@/lib/sanity/text";
import type { Announcement, BlogPost, CurrentAffair, Faq, Resource } from "@/types";

/**
 * Editorial content from Sanity, in the shapes the site's components already
 * take (`@/types`). Same idea as `lib/faculty/roster.ts`: mapping happens here
 * so `FAQAccordion`, `ResourceCard`, `BlogCard` and the rest never learn that
 * the source changed from `src/data/*` to the CMS.
 *
 * Every function inherits `sanityFetch`'s contract: an unconfigured or
 * unreachable CMS yields an empty list, and each page already has an empty
 * state for that.
 */

/** Credit for an article with no author set, rather than an empty byline. */
const HOUSE_BYLINE = "vidyantIAS Academic Team";

export async function getSiteFaqs(locale: Locale = DEFAULT_LOCALE): Promise<Faq[]> {
  const faqs = await getFaqs(locale);

  return faqs.map((faq) => ({
    // Seeded FAQs keep their old `src/data/faqs.ts` ids as document ids, so
    // `COURSE_FAQ_IDS` and any deep link still resolve.
    id: faq._id,
    question: faq.question,
    answer: plainText(faq.answer),
    topics: faq.topics,
    featured: faq.featured,
    status: "published",
  }));
}

/** `ids` filter, in the CMS sort order — same contract as the old `faqsByIds`. */
export function faqsByIds(faqs: Faq[], ids: string[]): Faq[] {
  return faqs.filter((faq) => ids.includes(faq.id));
}

export async function getSiteResources(locale: Locale = DEFAULT_LOCALE): Promise<Resource[]> {
  const resources = await getFreeResources(locale);

  return resources.map((resource) => ({
    id: resource._id,
    slug: resource.slug,
    title: resource.title,
    description: resource.description ?? "",
    type: resource.resourceType,
    tracks: resource.tracks,
    // No file yet → `ResourceCard` routes the visitor to the request form.
    // A paid resource never exposes its file: the Sanity CDN URL is public, so
    // handing it out would give the material away.
    href: resource.price ? "" : (resource.fileUrl ?? ""),
    // Free resources with written content are read on their own page.
    readHref: resource.hasContent ? `${ROUTES.resources}/${resource.slug}` : null,
    requiresLead: resource.requiresLead,
    price: resource.price && resource.price > 0 ? resource.price : null,
    pages: resource.pages,
    status: "published",
  }));
}

export async function getSitePosts(locale: Locale = DEFAULT_LOCALE): Promise<BlogPost[]> {
  const posts = await getLatestBlogs(50, locale);

  return posts.map((post) => ({
    id: post._id,
    slug: post.slug,
    // A taxonomy projection over a missing array comes back as null.
    category: post.categories?.[0] ?? "Article",
    title: post.title,
    excerpt: post.excerpt ?? "",
    readingTimeMinutes: post.readingMinutes ?? 5,
    author: post.authorName ?? HOUSE_BYLINE,
    publishedAt: post.publishedAt,
    image: post.coverImage?.url,
    status: "published",
  }));
}

export async function getSiteCurrentAffairs(
  locale: Locale = DEFAULT_LOCALE,
  limit = 50,
): Promise<CurrentAffair[]> {
  const items = await getCurrentAffairs(limit, locale);

  return items.map((item) => ({
    id: item._id,
    slug: item.slug,
    subject: item.category,
    title: item.title,
    whyItMatters: item.summary ?? "",
    relevance: item.relevance ?? [],
    publishedAt: item.date,
    status: "published",
  }));
}

/** Notices whose window covers now, newest first — filtered by the query itself. */
export async function getSiteAnnouncements(
  locale: Locale = DEFAULT_LOCALE,
): Promise<Announcement[]> {
  const notices = await getActiveAnnouncements(locale);

  return notices.map((notice) => ({
    id: notice._id,
    title: notice.title,
    body: notice.body,
    tone: notice.tone ?? "info",
    href: notice.href,
    startsAt: notice.startsAt,
    endsAt: notice.endsAt,
  }));
}
