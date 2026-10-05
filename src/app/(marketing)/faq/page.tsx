import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { CTASection } from "@/components/ui/CTASection";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { publishedFaqs } from "@/data/faqs";
import { CTA, ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/structured-data";

export const metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers about vidyantIAS programs in Pune — batches, online classes, recordings, mentorship, answer evaluation, fees, demo classes and counselling.",
  path: ROUTES.faq,
});

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions aspirants ask us"
        description="If something is missing here, ask the academic team. Nothing essential is kept behind a form."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "FAQ" }]}
      />

      <Section containerSize="default">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <SectionHeader
              eyebrow="Still unclear?"
              title="Ask us directly"
              description="A counsellor can answer specifics about your attempt, batch timings and fees."
            />
            <div className="mt-8 flex flex-col gap-3">
              <ButtonLink href={CTA.counselling.href} variant="primary">
                {CTA.counselling.label}
              </ButtonLink>
              <ButtonLink href={ROUTES.contact} variant="secondary">
                Contact the centre
              </ButtonLink>
            </div>
          </div>

          <FAQAccordion faqs={publishedFaqs} />
        </div>
      </Section>

      <CTASection
        title="Get an answer specific to your attempt."
        description="Programs, timelines and fees differ by stage — a short call settles all of it."
        location="faq-final"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqSchema(
              publishedFaqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
            ),
          ),
        }}
      />
    </>
  );
}
