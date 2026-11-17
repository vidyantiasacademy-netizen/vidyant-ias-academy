import { ArrowRight, Headset } from "lucide-react";

import { SectionArt } from "@/components/ui/SectionArt";
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
    <Section id="faq" tone="white" containerSize="wide" art={<SectionArt variant="soft-left" />}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-4">
          <SectionHeader
            layout="stack"
            eyebrow="FAQ"
            title={
              <>
                Questions aspirants <em>ask us</em>
              </>
            }
            description="If your question is not here, ask it directly — nothing important is kept behind a form."
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start">
            <ButtonLink href={CTA.counselling.href} variant="kesar" size="lg" className="rounded-xl shadow-soft">
              <Headset aria-hidden className="size-5" />
              Talk to an Academic Counsellor
              <ArrowRight aria-hidden className="size-5" />
            </ButtonLink>
            <ButtonLink href={ROUTES.faq} variant="link" className="h-auto px-0">
              Read all FAQs
            </ButtonLink>
          </div>
        </div>

        {/* A hairline divides the two columns from lg, as in an editorial spread. */}
        <FAQAccordion
          faqs={faqs}
          withIcons
          className="lg:col-span-8 lg:border-l lg:border-line-strong lg:pl-12"
        />
      </div>
    </Section>
  );
}
