import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { SearchExperience } from "@/components/search/SearchExperience";
import { searchIndex } from "@/lib/search";
import { ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Search",
  description:
    "Search vidyantIAS programs, faculty, free resources and frequently asked questions.",
  path: "/search",
  noIndex: true,
});

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const raw = params.q;
  const initialQuery = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");

  return (
    <>
      <PageHero
        eyebrow="Search"
        title="Find what you need."
        description="Programs, faculty, free resources and answers — all searchable from one place."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Search" }]}
      />

      <Section containerSize="default">
        <SearchExperience docs={searchIndex} initialQuery={initialQuery} />
      </Section>
    </>
  );
}
