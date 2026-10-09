import { Section } from "@/components/layout/Section";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { railItem, railList } from "@/components/ui/rail";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/constants/site";
import type { Resource } from "@/types";

/**
 * Study material: paid notes and compilations first, because they are what
 * the institute sells, then a few free downloads as the try-before-you-buy.
 */
export function ResourcesSection({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) return null;

  const premium = resources.filter((resource) => resource.price !== null);
  const free = resources.filter((resource) => resource.price === null);
  const shown = premium.length > 0 ? [...premium, ...free].slice(0, 6) : resources;

  return (
    <Section id="resources" containerSize="wide">
      <SectionHeader
        accent="chilli"
        eyebrow={premium.length > 0 ? "Study Material" : "Free Resources"}
        title={
          premium.length > 0
            ? "Notes and compilations, ready to study."
            : "Start learning before you enrol."
        }
        description={
          premium.length > 0
            ? "Premium material written by our faculty, alongside free downloads you can read before deciding. Buy only what you need — no course enrolment required."
            : "Useful preparation material, free and without conditions. Read the syllabus, follow the roadmap, and decide for yourself whether our approach suits you."
        }
        action={
          <ButtonLink href={ROUTES.resources} variant="secondary">
            {premium.length > 0 ? "Browse all material" : "Explore Free Resources"}
          </ButtonLink>
        }
      />

      <ul className={cn(railList[3], "mt-7 lg:mt-9")}>
        {shown.map((resource) => (
          <li key={resource.id} className={railItem}>
            <ResourceCard resource={resource} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
