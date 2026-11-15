import { DEFAULT_LOCALE, localizeHref, type Locale } from "@/i18n/config";
import { BRAND, CONTACT, SITE_URL, SOCIAL_LINKS } from "@/lib/constants/site";

/** Absolute URL for a locale-free path, in the reader's language. */
export function absoluteUrl(path: string, locale: Locale = DEFAULT_LOCALE) {
  return new URL(localizeHref(path, locale), SITE_URL).toString();
}

/**
 * A value that is still a placeholder must not reach structured data: Google
 * would associate the institute with a wrong phone number or with Instagram
 * itself. These go live on their own once `CONTACT` / `SOCIAL_LINKS` are
 * filled in.
 */
const isPlaceholderPhone = (phone: string) => /^\+?91[\s-]*0[\s0-]*$/.test(phone);
const isProfileUrl = (href: string) => {
  try {
    return new URL(href).pathname.replace(/\/+$/, "") !== "";
  } catch {
    return false;
  }
};

/** "Monday – Saturday" + "9:00 am – 8:00 pm" → OpeningHoursSpecification. */
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function to24h(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toLowerCase() === "pm") hours += 12;
  return `${String(hours).padStart(2, "0")}:${match[2]}`;
}
function openingHours() {
  return CONTACT.openingHours.flatMap(({ days, hours }) => {
    const [from, to] = days.split(/\s*[–-]\s*/);
    const start = DAY_ORDER.indexOf(from);
    const end = to ? DAY_ORDER.indexOf(to) : start;
    const [opens, closes] = hours.split(/\s*[–-]\s*/).map(to24h);
    if (start < 0 || end < 0 || !opens || !closes) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_ORDER.slice(start, end + 1),
        opens,
        closes,
      },
    ];
  });
}

/** Local-business / educational-organisation schema for the Pune centre. */
export function organizationSchema() {
  const sameAs = SOCIAL_LINKS.map((link) => link.href).filter(isProfileUrl);

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND.name,
    description: BRAND.description,
    url: SITE_URL,
    logo: `${SITE_URL}/apple-icon.png`,
    image: `${SITE_URL}/opengraph-image`,
    slogan: BRAND.tagline,
    areaServed: { "@type": "City", name: CONTACT.addressLocality },
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.addressLines[0],
      addressLocality: CONTACT.addressLocality,
      addressRegion: CONTACT.addressRegion,
      postalCode: CONTACT.postalCode,
      addressCountry: CONTACT.country,
    },
    ...(isPlaceholderPhone(CONTACT.phoneDisplay) ? {} : { telephone: CONTACT.phoneDisplay }),
    email: CONTACT.email,
    openingHoursSpecification: openingHours(),
    knowsAbout: ["UPSC Civil Services Examination", "IAS preparation", "UPSC Prelims", "UPSC Mains"],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND.name,
    url: SITE_URL,
    inLanguage: ["en-IN", "hi-IN"],
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * FAQPage. Google retired FAQ rich results (May 2026), so this earns no SERP
 * feature; it stays because it is accurate markup for genuine on-page Q&A.
 */
export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** The breadcrumb trail shown on the page, as BreadcrumbList. */
export function breadcrumbSchema(
  items: { label: string; href?: string }[],
  currentPath: string | null,
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const path = item.href ?? (index === items.length - 1 ? currentPath : null);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        ...(path ? { item: absoluteUrl(path, locale) } : {}),
      };
    }),
  };
}

/** Course modes as Schema.org expects them. */
function courseMode(mode: string) {
  const value = mode.toLowerCase();
  if (value.includes("hybrid") || value.includes("blend")) return "Blended";
  if (value.includes("online") || value.includes("live")) return "Online";
  return "Onsite";
}

export function courseSchema(course: {
  title: string;
  shortDescription: string;
  slug: string;
  mode?: string[];
  priceInPaise?: number | null;
}) {
  const url = `${SITE_URL}/courses/${course.slug}`;
  const modes = [...new Set((course.mode ?? []).map(courseMode))];

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    name: course.title,
    description: course.shortDescription,
    url,
    inLanguage: "en-IN",
    educationalLevel: "UPSC Civil Services Examination",
    provider: {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: BRAND.name,
      sameAs: SITE_URL,
    },
    // Only real data: a price when the catalogue has one, modes when listed.
    ...(course.priceInPaise
      ? {
          offers: {
            "@type": "Offer",
            category: "Paid",
            price: (course.priceInPaise / 100).toFixed(2),
            priceCurrency: "INR",
            url,
          },
        }
      : {}),
    ...(modes.length > 0
      ? {
          hasCourseInstance: modes.map((mode) => ({
            "@type": "CourseInstance",
            courseMode: mode,
            ...(mode !== "Online"
              ? { location: { "@type": "Place", name: `${BRAND.name}, ${CONTACT.addressLocality}` } }
              : {}),
          })),
        }
      : {}),
  };
}

/** Blog posts, current-affairs analyses and notes: who wrote what, and when. */
export function articleSchema(input: {
  type?: "Article" | "BlogPosting" | "NewsArticle";
  headline: string;
  description?: string | null;
  path: string;
  locale: Locale;
  datePublished?: string | null;
  dateModified?: string | null;
  image?: string | null;
  authorName?: string | null;
  section?: string | null;
}) {
  const url = absoluteUrl(input.path, input.locale);

  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "Article",
    "@id": `${url}#article`,
    headline: input.headline.slice(0, 110),
    ...(input.description ? { description: input.description } : {}),
    url,
    mainEntityOfPage: url,
    inLanguage: input.locale === "hi" ? "hi-IN" : "en-IN",
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ?? input.datePublished
      ? { dateModified: input.dateModified ?? input.datePublished }
      : {}),
    image: input.image ?? `${SITE_URL}/opengraph-image`,
    ...(input.section ? { articleSection: input.section } : {}),
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** A note: a PDF, described as an Article that is also a learning resource. */
export function studyNoteSchema(input: {
  title: string;
  summary: string;
  slug: string;
  locale: Locale;
  subject: string | null;
  stages: string[];
  revisedAt: string;
  pdfUrl: string | null;
}) {
  const base = articleSchema({
    headline: input.title,
    description: input.summary,
    path: `/notes/${input.slug}`,
    locale: input.locale,
    dateModified: input.revisedAt,
    datePublished: input.revisedAt,
    section: input.subject,
  });

  return {
    ...base,
    "@type": ["Article", "LearningResource"],
    learningResourceType: "Study notes",
    isAccessibleForFree: true,
    ...(input.subject ? { about: input.subject } : {}),
    ...(input.stages.length > 0
      ? { educationalUse: input.stages.map((stage) => `UPSC ${stage}`).join(", ") }
      : {}),
    ...(input.pdfUrl
      ? { associatedMedia: { "@type": "MediaObject", contentUrl: input.pdfUrl, encodingFormat: "application/pdf" } }
      : {}),
  };
}

/**
 * JSON for a `<script type="application/ld+json">`. Escapes `<` so CMS text
 * containing `</script>` cannot close the tag early.
 */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
