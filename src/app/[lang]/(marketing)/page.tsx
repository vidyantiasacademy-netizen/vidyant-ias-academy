import { HomeHero } from "@/components/hero/HomeHero";
import { AppDownloadSection } from "@/components/home/AppDownloadSection";
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
import { BRAND } from "@/lib/constants/site";
import { getSiteFaqs, getSiteResources } from "@/lib/content/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import { pageMetadata, SEO_KEYWORDS } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/structured-data";

export const generateMetadata = () => pageMetadata({
  title: `${BRAND.name} — UPSC Coaching & Mentorship in ${BRAND.city}`,
  description:
    "vidyantIAS is a UPSC preparation institute in Pune offering Foundation, Prelims, Mains and Optional programs for UPSC CSE 2026, with personal mentorship, structured testing and Mains answer evaluation. Enrol, book a free counselling session or attend a free demo class.",
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
        Phones (below md) get a decluttered page: hero → explore tiles →
        programs (compact) → faculty → app (compact) → orientation. Everything else is a headline the
        explore tiles already link to, and the sticky bottom bar carries
        counselling, WhatsApp and call — so those sections are md-up only.
      */}
      <HomeHero />
      <div className="hidden md:block">
        <TrustBar />
      </div>
      {/* The way off the homepage: one card per page. The header nav only
          scrolls between the sections below. */}
      <ExploreCards />
      {/* What we sell sits directly under the hero, priced and buyable. */}
      <ProgramsSection courses={courses} />
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
      {/* <ResultsSection /> */}
      {/* <TestimonialsSection /> */}
      {/* <CurrentAffairsSection /> */}
      {/* App sits between the two indigo bands (system, orientation) so they never touch. */}
      <AppDownloadSection />
      <OrientationSection />
      {/* <EventsSection /> */}
      {/* <SocialSection /> */}
      <div className="hidden md:block">
        <HomeFaq faqs={featuredFaqs} />
        <ContactSection />
      </div>
      {/* On phones the orientation band closes the page; this would be a
          second indigo band touching it, and the sticky bar already offers
          counselling. */}
      <CTASection
        className="max-md:hidden"
        title="Your UPSC preparation deserves a clear direction."
        description="Speak with our academic team to understand the right preparation path for your attempt."
        location="home-final"
        illustration={<GeoComposition surface="dark" className="mx-auto hidden size-64 lg:block xl:size-72" />}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
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
