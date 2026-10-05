import { MessageSquareQuote } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { publishedTestimonials } from "@/data/testimonials";
import { CTA, ROUTES } from "@/lib/constants/site";

export function TestimonialsSection() {
  const testimonials = publishedTestimonials.slice(0, 3);

  return (
    <Section tone="paper" id="testimonials" containerSize="wide">
      <SectionHeader
        eyebrow="Student Voices"
        title="What our students say"
        description="We publish a testimonial only after the student has given consent and we can stand behind what it says."
        action={
          testimonials.length > 0 ? (
            <ButtonLink href={ROUTES.testimonials} variant="secondary">
              Read all testimonials
            </ButtonLink>
          ) : undefined
        }
      />

      {testimonials.length > 0 ? (
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
          {testimonials.map((testimonial) => (
            <li key={testimonial.id}>
              <TestimonialCard testimonial={testimonial} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-12"
          icon={<MessageSquareQuote aria-hidden className="size-5" />}
          title="Our first cohort is preparing right now"
          description="vidyantIAS is a new institute, so there are no student testimonials to show yet — and we would rather leave this space empty than fill it with words no student said. Until then, judge us the way you should judge any institute: attend a class and speak to the faculty."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={CTA.demo.href} variant="primary">
                {CTA.demo.label}
              </ButtonLink>
              <ButtonLink href={CTA.counselling.href} variant="secondary">
                {CTA.counselling.label}
              </ButtonLink>
            </div>
          }
        />
      )}
    </Section>
  );
}
