import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTA, ROUTES } from "@/lib/constants/site";
import type { Faq } from "@/types";

/** `faqs` are the homepage-featured ones, already capped by the caller. */
export function HomeFaq({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <Section id="faq">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-4">
          <SectionHeader
            layout="stack"
            eyebrow="FAQ"
            title="Questions aspirants ask us"
            description="If your question is not here, ask it directly — nothing important is kept behind a form."
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start">
            <ButtonLink href={CTA.counselling.href} variant="primary">
              Talk to an Academic Counsellor
            </ButtonLink>
            <ButtonLink href={ROUTES.faq} variant="secondary">
              Read all FAQs
            </ButtonLink>
          </div>
        </div>

        <FAQAccordion faqs={faqs} className="lg:col-span-8" />
      </div>
    </Section>
  );
}
