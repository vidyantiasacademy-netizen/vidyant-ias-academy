import { HomeHero } from "@/components/hero/HomeHero";
import { AppDownloadSection } from "@/components/home/AppDownloadSection";
import { BatchesSection } from "@/components/home/BatchesSection";
import { ContactSection } from "@/components/home/ContactSection";
import { CurrentAffairsSection } from "@/components/home/CurrentAffairsSection";
import { EventsSection } from "@/components/home/EventsSection";
import { FacultySection } from "@/components/home/FacultySection";
import { HomeFaq } from "@/components/home/HomeFaq";
import { LearningSystem } from "@/components/home/LearningSystem";
import { MentorshipSection } from "@/components/home/MentorshipSection";
import { NoticeboardSection } from "@/components/home/NoticeboardSection";
import { OrientationSection } from "@/components/home/OrientationSection";
import { PerformanceTracking } from "@/components/home/PerformanceTracking";
import { ProgramsSection } from "@/components/home/ProgramsSection";
import { ResourcesSection } from "@/components/home/ResourcesSection";
import { ResultsSection } from "@/components/home/ResultsSection";
import { SocialSection } from "@/components/home/SocialSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustBar } from "@/components/home/TrustBar";
import { WhyVidyantIas } from "@/components/home/WhyVidyantIas";
import { CTASection } from "@/components/ui/CTASection";
import { featuredFaqs } from "@/data/faqs";
import { BRAND } from "@/lib/constants/site";
import { pageMetadata, SEO_KEYWORDS } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/structured-data";

export const metadata = pageMetadata({
  title: `${BRAND.name} — UPSC Coaching & Mentorship in ${BRAND.city}`,
  description:
    "vidyantIAS is a UPSC preparation institute in Pune offering Foundation, Prelims, Mains and Optional programs for UPSC CSE 2026, with personal mentorship, structured testing and Mains answer evaluation. Enrol, book a free counselling session or attend a free demo class.",
  path: "/",
  keywords: [...SEO_KEYWORDS.primary, ...SEO_KEYWORDS.secondary],
});

export default function HomePage() {
  return (
    <>
      {/*
        Section order answers the four questions a visitor arrives with, in order:
        who are you → what do you offer → why trust you → what do I do next.
      */}
      <HomeHero />
      <TrustBar />
      <NoticeboardSection />
      <BatchesSection />
      <ProgramsSection />
      <WhyVidyantIas />
      <LearningSystem />
      <MentorshipSection />
      <PerformanceTracking />
      <FacultySection />
      <ResultsSection />
      <TestimonialsSection />
      <ResourcesSection />
      <CurrentAffairsSection />
      <OrientationSection />
      <EventsSection />
      <AppDownloadSection />
      <SocialSection />
      <HomeFaq />
      <ContactSection />
      <CTASection
        title="Your UPSC preparation deserves a clear direction."
        description="Speak with our academic team to understand the right preparation path for your attempt."
        location="home-final"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqSchema(
              featuredFaqs.slice(0, 7).map((faq) => ({
                question: faq.question,
                answer: faq.answer,
              })),
            ),
          ),
        }}
      />
    </>
  );
}
