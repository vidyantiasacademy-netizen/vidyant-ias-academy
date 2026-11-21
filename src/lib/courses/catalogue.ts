import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getFacultyRoster } from "@/lib/faculty/roster";
import { getImage, type IMAGES } from "@/lib/constants/images";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { isOnlineCheckoutEnabled } from "@/lib/payments/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { collection } from "@/lib/firebase/firestore";
import { projectedImageUrl } from "@/lib/sanity/image";
import { getCourses } from "@/lib/sanity/queries";
import { plainText } from "@/lib/sanity/text";
import type { CourseContent } from "@/lib/sanity/types";
import type { Course, CourseCategory } from "@/types";
import type { CourseDoc } from "@/types/db";

import { COURSE_FAQ_IDS, DELIVERY_MODE_LABELS } from "./labels";
import { COURSE_POSTER_SLUGS } from "./posters";

/**
 * The course catalogue the public site renders — the join of two sources.
 *
 * `courses/{courseId}` in Firestore decides *whether* a programme is offered
 * and owns everything the application reasons about: category, delivery modes,
 * duration, price and publish status. The Sanity `course` document whose slug
 * equals that record's `sanitySlug` supplies the words. A programme is listed
 * only when both exist: a published record with no copy would be a page with a
 * price and nothing else, and copy with no record would be a programme nobody
 * can enrol in.
 *
 * Mapping happens here so the cards, filters and course page keep taking one
 * `Course` shape and never learn which store a field came from.
 */

/** Invalidated by the admin course actions, so an edit shows without waiting out `revalidate`. */
export const COURSES_CACHE_TAG = "firestore:courses";

/** What the join reads from Firestore. Plain data, so `unstable_cache` can serialise it. */
type CourseRecord = Pick<
  CourseDoc,
  "slug" | "title" | "category" | "modes" | "price" | "durationMonths" | "sanitySlug"
> & { id: string };

const getPublishedRecords = unstable_cache(
  async (): Promise<CourseRecord[]> => {
    if (!isAdminConfigured()) return [];

    try {
      const snapshot = await collection(COLLECTIONS.courses)
        .where("status", "==", "published")
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data() as CourseDoc;

        return {
          id: doc.id,
          slug: data.slug,
          title: data.title,
          category: data.category,
          modes: data.modes ?? [],
          price: data.price ?? null,
          durationMonths: data.durationMonths ?? null,
          sanitySlug: data.sanitySlug ?? null,
        };
      });
    } catch (error) {
      // Same contract as `sanityFetch`: an outage empties the catalogue, it
      // does not take down every page that lists a course.
      console.error("[courses] Firestore read failed", error);
      return [];
    }
  },
  ["courses:published"],
  { tags: [COURSES_CACHE_TAG], revalidate: 3600 },
);

const RUPEES = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** The honest default for a fee the institute quotes in person. */
const FEE_ON_COUNSELLING = "Shared transparently during counselling, including instalment options";

/**
 * Card image per stage, shown until the course's Sanity document has a hero
 * image. Replacing the registry entry or uploading a hero image retires it.
 */
const STAGE_PHOTO: Record<CourseCategory, keyof typeof IMAGES> = {
  foundation: "courseFoundation",
  prelims: "coursePrelims",
  mains: "courseMains",
  optional: "courseOptional",
  "test-series": "lectureHall",
};

/**
 * Card art, in order: the Sanity hero image, the designed poster from
 * `npm run courses:posters`, then the stage photo.
 */
function courseImage(
  slug: string,
  content: CourseContent,
  category: CourseCategory,
): Course["image"] {
  const hero = content.heroImage;
  if (hero?.url) {
    return {
      src: projectedImageUrl(hero, { width: 960, height: 640 }),
      alt: hero.alt ?? content.title,
      lqip: hero.lqip ?? undefined,
    };
  }

  if (COURSE_POSTER_SLUGS.has(slug)) {
    return {
      src: `/images/courses/posters/${slug}.webp`,
      alt: `${content.title} — programme poster`,
    };
  }

  const photo = getImage(STAGE_PHOTO[category]);
  return { src: photo.src ?? "", alt: photo.alt };
}

function toCourse(
  record: CourseRecord,
  content: CourseContent,
  subjectBySlug: Map<string, string>,
): Course {
  const months = record.durationMonths;

  return {
    id: record.id,
    slug: record.slug,
    sanitySlug: content.slug,
    category: record.category,
    title: content.title,
    shortDescription: content.summary ?? "",
    description: plainText(content.body) || (content.summary ?? ""),
    audience: content.audience,
    duration: months
      ? `${months} ${months === 1 ? "month" : "months"}`
      : (content.durationNote ?? "Duration confirmed by the academic team"),
    mode: record.modes.map((mode) => DELIVERY_MODE_LABELS[mode]),
    features: content.highlights,
    outcomes: content.outcomes,
    curriculum: content.curriculum,
    tests: content.tests ?? "",
    mentorship: content.mentorship ?? "",
    studyMaterial: content.studyMaterial,
    schedule: content.schedule ?? "Timings shared at enrolment",
    fee: record.price ? RUPEES.format(record.price.amountInPaise / 100) : FEE_ON_COUNSELLING,
    priceInPaise: record.price?.amountInPaise ?? null,
    buyOnline: Boolean(record.price) && isOnlineCheckoutEnabled(),
    // A reference to an unpublished profile resolves to null in the published
    // perspective, and the roster only holds published ones.
    faculty: content.facultySlugs.flatMap((slug) => {
      const subject = slug ? subjectBySlug.get(slug) : undefined;
      return slug && subject !== undefined ? [{ slug, subject }] : [];
    }),
    faqIds: COURSE_FAQ_IDS[record.category] ?? [],
    card: {
      tagline: content.card?.tagline?.trim() || null,
      badge: content.card?.badge?.trim() || null,
      format: content.card?.format?.trim() || null,
      keyFact: content.card?.keyFact?.trim() || null,
    },
    image: courseImage(record.slug, content, record.category),
    status: "published",
  };
}

/**
 * Every listed programme, in the Sanity sort order. Copy comes in `locale`, or
 * in English where a translation is missing. Deduplicated per request, since a
 * page's metadata and body both read it.
 */
export const getCourseCatalogue = cache(
  async (locale: Locale = DEFAULT_LOCALE): Promise<Course[]> => {
    const [records, contents, roster] = await Promise.all([
      getPublishedRecords(),
      getCourses(locale),
      getFacultyRoster(locale),
    ]);

    const contentBySlug = new Map(contents.map((content) => [content.slug, content]));
    const subjectBySlug = new Map(roster.map((member) => [member.slug, member.subject]));

    return records
      .flatMap((record) => {
        const content = record.sanitySlug ? contentBySlug.get(record.sanitySlug) : undefined;
        return content ? [{ record, content }] : [];
      })
      .sort(
        (a, b) =>
          a.content.order - b.content.order || a.content.title.localeCompare(b.content.title),
      )
      .map(({ record, content }) => toCourse(record, content, subjectBySlug));
  },
);

export async function getCatalogueCourse(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Course | null> {
  const catalogue = await getCourseCatalogue(locale);

  return catalogue.find((course) => course.slug === slug) ?? null;
}

/**
 * The first programme of each category, in catalogue order — for surfaces that
 * show one entry per stage (the homepage strip, the hero shortcuts).
 */
export function firstPerCategory(courses: Course[]): Course[] {
  const seen = new Set<Course["category"]>();

  return courses.filter((course) => {
    if (seen.has(course.category)) return false;
    seen.add(course.category);
    return true;
  });
}
