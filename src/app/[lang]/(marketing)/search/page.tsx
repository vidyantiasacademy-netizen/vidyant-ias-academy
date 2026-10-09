import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { SearchExperience } from "@/components/search/SearchExperience";
import { getLocale } from "@/i18n/server";
import { buildSearchIndex } from "@/lib/search";
import { ROUTES } from "@/lib/constants/site";
import {
  getSiteCurrentAffairs,
  getSiteFaqs,
  getSitePosts,
  getSiteResources,
} from "@/lib/content/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import { getFacultyRoster } from "@/lib/faculty/roster";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "Search",
  description:
    "Search vidyantIAS programs, faculty, free resources and frequently asked questions.",
  path: "/search",
  noIndex: true,
});

export default async function SearchPage({ searchParams }: PageProps<"/[lang]/search">) {
  const params = await searchParams;
  const raw = params.q;
  const initialQuery = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  const locale = await getLocale();
  const [courses, faculty, resources, faqs, posts, affairs] = await Promise.all([
    getCourseCatalogue(locale),
    getFacultyRoster(locale),
    getSiteResources(locale),
    getSiteFaqs(locale),
    getSitePosts(locale),
    getSiteCurrentAffairs(locale),
  ]);
  const docs = buildSearchIndex({ courses, faculty, resources, faqs, posts, affairs });

  return (
    <>
      <PageHero
        eyebrow="Search"
        title="Find what you need."
        description="Programs, faculty, free resources and answers — all searchable from one place."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Search" }]}
      />

      <Section containerSize="default">
        <SearchExperience docs={docs} initialQuery={initialQuery} />
      </Section>
    </>
  );
}
