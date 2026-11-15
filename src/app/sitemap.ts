import type { MetadataRoute } from "next";

import { UPSC_GUIDES } from "@/data/upsc-guides";
import { LOCALES, LOCALE_META, localizeHref } from "@/i18n/config";
import { ROUTES, SITE_URL } from "@/lib/constants/site";
import { getSiteCurrentAffairs, getSitePosts } from "@/lib/content/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import { getStudyNotes } from "@/lib/sanity/queries";
import { getFacultyRoster } from "@/lib/faculty/roster";

type Entry = MetadataRoute.Sitemap[number];

/**
 * One URL per locale for a locale-free `path`, each listing every language
 * version as an `hreflang` alternate — Google wants the full set on each URL.
 */
function localized(path: string, entry: Omit<Entry, "url" | "alternates">): Entry[] {
  const absolute = (locale: (typeof LOCALES)[number]) =>
    new URL(localizeHref(path, locale), SITE_URL).toString();

  const languages = Object.fromEntries(
    LOCALES.map((locale) => [LOCALE_META[locale].htmlLang, absolute(locale)]),
  );

  return LOCALES.map((locale) => ({
    ...entry,
    url: absolute(locale),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [faculty, courses, posts, affairs, notes] = await Promise.all([
    getFacultyRoster(),
    getCourseCatalogue(),
    getSitePosts(),
    getSiteCurrentAffairs(undefined, 200),
    getStudyNotes(),
  ]);

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
    { path: ROUTES.results, priority: 0.7, changeFrequency: "monthly" },
    { path: ROUTES.testimonials, priority: 0.6, changeFrequency: "monthly" },
    { path: ROUTES.resources, priority: 0.7, changeFrequency: "weekly" },
    { path: ROUTES.currentAffairs, priority: 0.7, changeFrequency: "daily" },
    { path: ROUTES.notes, priority: 0.8, changeFrequency: "weekly" },
    { path: ROUTES.quizzes, priority: 0.7, changeFrequency: "weekly" },
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

  return [
    ...staticRoutes.flatMap((route) =>
      localized(route.path, {
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }),
    ),
    ...courses.flatMap((course) =>
      localized(`/courses/${course.slug}`, {
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      }),
    ),
    ...faculty.flatMap((member) =>
      localized(`/faculty/${member.slug}`, {
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    ),
    ...posts.flatMap((post) =>
      localized(`/blog/${post.slug}`, {
        lastModified: new Date(post.publishedAt),
        changeFrequency: "yearly",
        priority: 0.5,
      }),
    ),
    // Translations share a slug, so one entry per slug covers every language.
    ...[...new Set(notes.map((note) => note.slug))].flatMap((slug) => {
      const note = notes.find((n) => n.slug === slug)!;
      return localized(`${ROUTES.notes}/${slug}`, {
        lastModified: new Date(`${note.revisedAt}T00:00:00Z`),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }),
    ...affairs.flatMap((item) =>
      localized(`/current-affairs/${item.slug}`, {
        lastModified: new Date(item.publishedAt),
        changeFrequency: "yearly",
        priority: 0.5,
      }),
    ),
  ];
}
