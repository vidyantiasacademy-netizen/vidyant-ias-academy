import { Section } from "@/components/layout/Section";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { publishedResources } from "@/data/resources";
import { ROUTES } from "@/lib/constants/site";

export function ResourcesSection() {
  return (
    <Section id="resources" containerSize="wide">
      <SectionHeader
        eyebrow="Free Resources"
        title="Start learning before you enrol."
        description="Useful preparation material, free and without conditions. Read the syllabus, follow the roadmap, and decide for yourself whether our approach suits you."
        action={
          <ButtonLink href={ROUTES.resources} variant="secondary">
            Explore Free Resources
          </ButtonLink>
        }
      />

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
        {publishedResources.map((resource) => (
          <li key={resource.id}>
            <ResourceCard resource={resource} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
