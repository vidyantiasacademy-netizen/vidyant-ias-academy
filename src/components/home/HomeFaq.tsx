import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { featuredFaqs } from "@/data/faqs";
import { CTA, ROUTES } from "@/lib/constants/site";

export function HomeFaq() {
  return (
    <Section id="faq">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeader
            eyebrow="FAQ"
            title="Questions aspirants ask us"
            description="If your question is not here, ask it directly — nothing important is kept behind a form."
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col">
            <ButtonLink href={CTA.counselling.href} variant="primary">
              Talk to an Academic Counsellor
            </ButtonLink>
            <ButtonLink href={ROUTES.faq} variant="secondary">
              Read all FAQs
            </ButtonLink>
          </div>
        </div>

        <FAQAccordion faqs={featuredFaqs.slice(0, 7)} />
      </div>
    </Section>
  );
}
