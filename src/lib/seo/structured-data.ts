import { BRAND, CONTACT, SITE_URL, SOCIAL_LINKS } from "@/lib/constants/site";

/** Local-business / educational-organisation schema for the Pune centre. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND.name,
    description: BRAND.description,
    url: SITE_URL,
    slogan: BRAND.tagline,
    areaServed: `${CONTACT.addressLocality}, ${CONTACT.addressRegion}, India`,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.addressLines[0],
      addressLocality: CONTACT.addressLocality,
      addressRegion: CONTACT.addressRegion,
      postalCode: CONTACT.postalCode,
      addressCountry: CONTACT.country,
    },
    telephone: CONTACT.phoneDisplay,
    email: CONTACT.email,
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND.name,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

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

export function courseSchema(course: {
  title: string;
  shortDescription: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.shortDescription,
    url: `${SITE_URL}/courses/${course.slug}`,
    provider: { "@id": `${SITE_URL}/#organization` },
  };
}
