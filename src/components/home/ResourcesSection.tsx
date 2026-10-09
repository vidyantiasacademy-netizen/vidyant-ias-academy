import { Section } from "@/components/layout/Section";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { railItem, railList } from "@/components/ui/rail";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/constants/site";
import type { Resource } from "@/types";

export function ResourcesSection({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) return null;

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

      <ul className={cn(railList[3], "mt-7 lg:mt-9")}>
        {resources.map((resource) => (
          <li key={resource.id} className={railItem}>
            <ResourceCard resource={resource} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
