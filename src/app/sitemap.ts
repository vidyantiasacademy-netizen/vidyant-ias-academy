import type { MetadataRoute } from "next";

import { UPSC_GUIDES } from "@/data/upsc-guides";
import { DEFAULT_LOCALE, LOCALE_META, localizeHref } from "@/i18n/config";
import { publishedResults } from "@/data/results";
import { publishedTestimonials } from "@/data/testimonials";
import { INDEXED_LOCALES } from "@/lib/seo/metadata";
import { ROUTES, SITE_URL } from "@/lib/constants/site";
import { getSiteCurrentAffairs, getSitePosts } from "@/lib/content/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import {
  getFreeResourceSlugs,
  getSitemapMeta,
  getStudyNotes,
  type SitemapMeta,
} from "@/lib/sanity/queries";
import { getFacultyRoster } from "@/lib/faculty/roster";

type Entry = MetadataRoute.Sitemap[number];

/**
 * One URL per indexed locale for a locale-free `path`, each listing every
 * language version as an `hreflang` alternate (Google wants the full set on
 * each URL). Untranslated locales are `noindex` and left out; see
 * `INDEXED_LOCALES`. With a single indexed locale there are no alternates.
 */
function localized(path: string, entry: Omit<Entry, "url" | "alternates">): Entry[] {
  const absolute = (locale: (typeof INDEXED_LOCALES)[number]) =>
    new URL(localizeHref(path, locale), SITE_URL).toString();

  const languages =
    INDEXED_LOCALES.length > 1
      ? {
          ...Object.fromEntries(
            INDEXED_LOCALES.map((locale) => [LOCALE_META[locale].htmlLang, absolute(locale)]),
          ),
          "x-default": absolute(DEFAULT_LOCALE),
        }
      : undefined;

  return INDEXED_LOCALES.map((locale) => ({
    ...entry,
    url: absolute(locale),
    ...(languages ? { alternates: { languages } } : {}),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [faculty, courses, posts, affairs, notes, resourceSlugs, meta] = await Promise.all([
    getFacultyRoster(),
    getCourseCatalogue(),
    getSitePosts(),
    getSiteCurrentAffairs(undefined, 200),
    getStudyNotes(),
    getFreeResourceSlugs(),
    getSitemapMeta(),
  ]);

  // Last edit and `noindex` per Sanity document, keyed `type:slug`.
  const metaByKey = new Map(meta.map((doc) => [`${doc._type}:${doc.slug}`, doc]));
  const metaFor = (type: SitemapMeta["_type"], slug: string) => metaByKey.get(`${type}:${slug}`);
  /** A page whose document is flagged `noindex` renders that way; keep it out. */
  const indexable = (type: SitemapMeta["_type"], slug: string) => !metaFor(type, slug)?.noIndex;
  /** The document's last publish, or nothing: a guessed date is worse than none. */
  const updated = (type: SitemapMeta["_type"], slug: string) => {
    const at = metaFor(type, slug)?._updatedAt;
    return at ? { lastModified: new Date(at) } : {};
  };

  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: ROUTES.home, priority: 1, changeFrequency: "weekly" },
    { path: ROUTES.courses, priority: 0.9, changeFrequency: "weekly" },
    { path: ROUTES.enrol, priority: 0.9, changeFrequency: "weekly" },
    { path: ROUTES.counselling, priority: 0.9, changeFrequency: "monthly" },
    { path: ROUTES.brochure, priority: 0.8, changeFrequency: "monthly" },
    { path: ROUTES.demo, priority: 0.9, changeFrequency: "monthly" },
    { path: ROUTES.about, priority: 0.8, changeFrequency: "monthly" },
    { path: ROUTES.faculty, priority: 0.8, changeFrequency: "monthly" },
    // Empty states are `noindex` until something is published; see their pages.
    ...(publishedResults.length > 0
      ? [
          {
            path: ROUTES.results,
            priority: 0.7,
            changeFrequency: "monthly" as const,
          },
        ]
      : []),
    ...(publishedTestimonials.length > 0
      ? [
          {
            path: ROUTES.testimonials,
            priority: 0.6,
            changeFrequency: "monthly" as const,
          },
        ]
      : []),
    { path: ROUTES.resources, priority: 0.7, changeFrequency: "weekly" },
    { path: ROUTES.currentAffairs, priority: 0.7, changeFrequency: "daily" },
    { path: ROUTES.notes, priority: 0.8, changeFrequency: "weekly" },
    { path: ROUTES.pyqTest, priority: 0.7, changeFrequency: "weekly" },
    { path: ROUTES.mockTest, priority: 0.9, changeFrequency: "weekly" },
    { path: ROUTES.upscGuide, priority: 0.8, changeFrequency: "monthly" },
    ...UPSC_GUIDES.map((guide) => ({
      path: `${ROUTES.upscGuide}/${guide.slug}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    { path: ROUTES.parents, priority: 0.7, changeFrequency: "monthly" },
    { path: ROUTES.blog, priority: 0.7, changeFrequency: "weekly" },
    { path: ROUTES.events, priority: 0.7, changeFrequency: "weekly" },
    { path: ROUTES.contact, priority: 0.7, changeFrequency: "monthly" },
    { path: ROUTES.faq, priority: 0.6, changeFrequency: "monthly" },
    { path: ROUTES.privacy, priority: 0.3, changeFrequency: "yearly" },
    { path: ROUTES.terms, priority: 0.3, changeFrequency: "yearly" },
    { path: ROUTES.refund, priority: 0.3, changeFrequency: "yearly" },
  ];

  // `lastModified` is set only where the CMS records a real date. Stamping
  // the request time on every entry teaches Google to ignore the field.
  return [
    ...staticRoutes.flatMap((route) =>
      localized(route.path, {
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }),
    ),
    ...courses.flatMap((course) =>
      localized(`/courses/${course.slug}`, {
        ...updated("course", course.sanitySlug),
        changeFrequency: "monthly",
        priority: 0.8,
      }),
    ),
    // Placeholder profiles render `noindex`, so they stay out of the sitemap.
    ...faculty
      .filter((member) => !member.isPlaceholder)
      .flatMap((member) =>
        localized(`/faculty/${member.slug}`, {
          ...updated("faculty", member.slug),
          changeFrequency: "monthly",
          priority: 0.6,
        }),
      ),
    ...posts
      .filter((post) => indexable("blog", post.slug))
      .flatMap((post) =>
        localized(`/blog/${post.slug}`, {
          lastModified: new Date(metaFor("blog", post.slug)?._updatedAt ?? post.publishedAt),
          changeFrequency: "yearly",
          priority: 0.5,
        }),
      ),
    ...resourceSlugs
      .filter((slug) => indexable("freeResource", slug))
      .flatMap((slug) =>
        localized(`${ROUTES.resources}/${slug}`, {
          ...updated("freeResource", slug),
          changeFrequency: "monthly",
          priority: 0.6,
        }),
      ),
    // Translations share a slug, so one entry per slug covers every language.
    ...[...new Set(notes.map((note) => note.slug))]
      .filter((slug) => indexable("studyNote", slug))
      .flatMap((slug) => {
        const note = notes.find((n) => n.slug === slug)!;
        return localized(`${ROUTES.notes}/${slug}`, {
          lastModified: new Date(`${note.revisedAt}T00:00:00Z`),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }),
    ...affairs
      .filter((item) => indexable("currentAffair", item.slug))
      .flatMap((item) =>
        localized(`/current-affairs/${item.slug}`, {
          lastModified: new Date(
            metaFor("currentAffair", item.slug)?._updatedAt ?? item.publishedAt,
          ),
          changeFrequency: "yearly",
          priority: 0.5,
        }),
      ),
  ];
}
