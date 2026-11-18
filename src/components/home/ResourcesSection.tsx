import { Section } from "@/components/layout/Section";
import { SectionArt } from "@/components/ui/SectionArt";
import { HomeResourceCard } from "@/components/resources/HomeResourceCard";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
    <Section tone="white" id="resources" containerSize="wide" art={<SectionArt variant="soft-left" />}>
      <SectionHeader
        layout="stack"
        eyebrow={premium.length > 0 ? "Study Material" : "Free Resources"}
        title={
          premium.length > 0 ? (
            <>
              Notes and compilations, <em>ready to study.</em>
            </>
          ) : (
            <>
              Start learning <em>before you enrol.</em>
            </>
          )
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

      {/* Rows of three on a 6-column grid; a short last row widens its cards
          to fill the line (5 → 3 + 2, 4 → 3 + 1). */}
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-6 lg:gap-6">
        {shown.map((resource, index) => (
          <li key={resource.id} className={cn("flex", spanFor(index, shown.length))}>
            <HomeResourceCard resource={resource} className="w-full" />
          </li>
        ))}
      </ul>
    </Section>
  );
}

const LG_SPAN: Record<number, string> = {
  1: "lg:col-span-6",
  2: "lg:col-span-3",
  3: "lg:col-span-2",
};

function spanFor(index: number, total: number) {
  const lastRowStart = total - (total % 3 || 3);
  return LG_SPAN[index >= lastRowStart ? total - lastRowStart : 3];
}
