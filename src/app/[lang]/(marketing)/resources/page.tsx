import { ResourceRequestForm } from "@/components/forms/ResourceRequestForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { CTASection } from "@/components/ui/CTASection";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getSiteResources } from "@/lib/content/site";
import { pageMetadata } from "@/lib/seo/metadata";
import type { ResourceTrack } from "@/types";

export const generateMetadata = () => pageMetadata({
  title: "Free UPSC Resources — Syllabus, Booklist, PYQ Strategy",
  description:
    "Free UPSC preparation material from vidyantIAS Pune: the Prelims and Mains syllabus, a recommended booklist, a starter roadmap, PYQ strategy and a weekly study planner.",
  path: ROUTES.resources,
  keywords: ["UPSC syllabus", "UPSC booklist", "UPSC PYQ strategy", "UPSC study plan"],
});

const FILTERS: { id: ResourceTrack | "all"; label: string }[] = [
  { id: "all", label: "All resources" },
  { id: "beginner", label: "Beginner" },
  { id: "prelims", label: "Prelims" },
  { id: "mains", label: "Mains" },
  { id: "optional", label: "Optional" },
  { id: "current-affairs", label: "Current Affairs" },
];

export default async function ResourcesPage() {
  const resources = await getSiteResources(await getLocale());

  return (
    <>
      <PageHero
        eyebrow="Free Resources"
        title="Start learning before you enrol."
        description="Material we would give any serious aspirant, whether or not they join vidyantIAS. Nothing essential is hidden behind a form."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Resources" }]}
      />

      <Section containerSize="wide">
        <ResourceFilters resources={resources} filters={FILTERS} />
      </Section>

      <Section tone="paper" containerSize="default">
        <ResourceRequestForm resources={resources} />
      </Section>

      <CTASection
        title="Want these turned into a plan for your attempt?"
        description="A counselling call converts the reading list into a sequence with dates, tests and review points."
        location="resources-final"
      />
    </>
  );
}
