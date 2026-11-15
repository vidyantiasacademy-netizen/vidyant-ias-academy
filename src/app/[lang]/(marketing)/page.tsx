import { HomeHero } from "@/components/hero/HomeHero";
import { AppDownloadSection } from "@/components/home/AppDownloadSection";
import { CallbackSection } from "@/components/home/CallbackSection";
// import { BatchesSection } from "@/components/home/BatchesSection";
import { ContactSection } from "@/components/home/ContactSection";
import { ExploreCards } from "@/components/home/ExploreCards";
// import { CurrentAffairsSection } from "@/components/home/CurrentAffairsSection";
// import { EventsSection } from "@/components/home/EventsSection";
import { FacultySection } from "@/components/home/FacultySection";
import { HomeFaq } from "@/components/home/HomeFaq";
import { LearningSystem } from "@/components/home/LearningSystem";
// import { MentorshipSection } from "@/components/home/MentorshipSection";
import { NoticeboardSection } from "@/components/home/NoticeboardSection";
import { OrientationSection } from "@/components/home/OrientationSection";
// import { PerformanceTracking } from "@/components/home/PerformanceTracking";
import { ProgrammeAdviceSection } from "@/components/home/ProgrammeAdviceSection";
import { ProgramsSection } from "@/components/home/ProgramsSection";
import { ResourcesSection } from "@/components/home/ResourcesSection";
// import { ResultsSection } from "@/components/home/ResultsSection";
// import { SocialSection } from "@/components/home/SocialSection";
// import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustBar } from "@/components/home/TrustBar";
// import { WhyVidyantIas } from "@/components/home/WhyVidyantIas";
import { GeoComposition } from "@/components/ui/Geometry";
import { CTASection } from "@/components/ui/CTASection";
import { getLocale } from "@/i18n/server";
import { BRAND, EXAM_CYCLE } from "@/lib/constants/site";
import { getSiteFaqs, getSiteResources } from "@/lib/content/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import { pageMetadata, SEO_KEYWORDS } from "@/lib/seo/metadata";
import { faqSchema, jsonLd } from "@/lib/seo/structured-data";

export const generateMetadata = () => pageMetadata({
  // Keyword first, brand last: "UPSC coaching in Pune" is what aspirants type.
  title: `UPSC Coaching in ${BRAND.city} with Mentorship | ${BRAND.name}`,
  description:
    `UPSC coaching in Pune for ${EXAM_CYCLE.label}: Foundation, Prelims, Mains and Optional, with a mentor from day one. Notes, free mock tests and counselling.`,
  path: "/",
  keywords: [...SEO_KEYWORDS.primary, ...SEO_KEYWORDS.secondary],
});

export default async function HomePage() {
  const locale = await getLocale();
  const [courses, faqs, resources] = await Promise.all([
    getCourseCatalogue(locale),
    getSiteFaqs(locale),
    getSiteResources(locale),
  ]);
  const featuredFaqs = faqs.filter((faq) => faq.featured).slice(0, 7);

  return (
    <>
      {/*
        Section order answers the four questions a visitor arrives with, in order:
        who are you → what do you offer (and for how much) → why trust you → what do I do next.
      */}
      {/*
        Phones (below md) get a decluttered page: hero → stage picker →
        explore tiles → faculty → callback form →
        orientation → app (compact). Everything else is a headline the
        explore tiles already link to, and the bottom tab bar carries
        counselling — so those sections are md-up only.
      */}
      <HomeHero />
      <div className="hidden md:block">
        <TrustBar />
      </div>
      {/* The way off the homepage: one card per page. The header nav only
          scrolls between the sections below. */}
      <div className="hidden md:block">
        <ExploreCards />
      </div>
      {/* What we sell sits directly under the hero, priced and buyable. */}
      <ProgramsSection courses={courses} />
      {/* Tablet and up: the callback form, once the programmes have been seen. */}
      <ProgrammeAdviceSection courses={courses} />
      {/* Phones: the page directory follows the stage picker instead. */}
      <div className="md:hidden">
        <ExploreCards headingId="explore-heading-phone" />
      </div>
      {/* Free material right after the paid programs: the low-commitment way in. */}
      <div className="hidden md:block">
        <ResourcesSection resources={resources} />
        <NoticeboardSection />
      </div>
      {/* <BatchesSection /> */}
      {/* <WhyVidyantIas /> */}
      <div className="hidden md:block">
        <LearningSystem />
      </div>
      {/* <MentorshipSection /> */}
      {/* <PerformanceTracking /> */}
      <FacultySection />
      {/* Phones only: the short callback form. */}
      <CallbackSection />
      {/* <ResultsSection /> */}
      {/* <TestimonialsSection /> */}
      {/* <CurrentAffairsSection /> */}
      <OrientationSection />
      {/* <EventsSection /> */}
      {/* <SocialSection /> */}
      <div className="hidden md:block">
        <HomeFaq faqs={featuredFaqs} />
        <ContactSection />
      </div>
      {/* Hidden on phones: it would be a second indigo band touching the
          orientation band, and the sticky bar already offers counselling. */}
      <CTASection
        className="max-md:hidden"
        title="Your UPSC preparation deserves a clear direction."
        description="Speak with our academic team to understand the right preparation path for your attempt."
        location="home-final"
        illustration={<GeoComposition surface="dark" className="mx-auto hidden size-64 lg:block xl:size-72" />}
      />
      {/* App closes the page: a paper band between the last indigo band and the footer. */}
      <AppDownloadSection />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            faqSchema(
              featuredFaqs.map((faq) => ({
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
