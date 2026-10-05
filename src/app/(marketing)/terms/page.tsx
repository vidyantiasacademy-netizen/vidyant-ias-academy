import { LegalPage } from "@/components/layout/LegalPage";
import { BRAND, CONTACT, ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Terms & Conditions",
  description: `The terms that apply to using the ${BRAND.name} website and enrolling in our UPSC programs.`,
  path: ROUTES.terms,
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description={`The terms that apply when you use this website or enrol in a ${BRAND.name} program.`}
      updated="September 2026"
      sections={[
        {
          heading: "Using this website",
          body: (
            <p>
              The content here — program descriptions, articles, resources and study material
              — is provided for the preparation of UPSC aspirants. You may use and print it
              for your own preparation. Republishing, reselling or distributing it commercially
              is not permitted.
            </p>
          ),
        },
        {
          heading: "Program information",
          body: (
            <p>
              Program structure, schedules, batch timings and fees are confirmed by the
              academic team at the time of enrolment. Where this site describes a duration or
              schedule, it is indicative and the written confirmation you receive at enrolment
              takes precedence.
            </p>
          ),
        },
        {
          heading: "Enrolment and conduct",
          body: (
            <p>
              Enrolment is personal to the student. Sharing login credentials, recordings or
              study material with non-enrolled persons may lead to withdrawal of access.
              Students are expected to maintain conduct that allows teaching to continue
              without disruption.
            </p>
          ),
        },
        {
          heading: "No guarantee of selection",
          body: (
            <p>
              {BRAND.name} provides teaching, testing, evaluation and mentorship. No institute
              can guarantee selection in the Civil Services Examination, and we make no such
              claim anywhere on this site or in person.
            </p>
          ),
        },
        {
          heading: "Changes",
          body: (
            <p>
              We may update these terms as programs evolve. Material changes will be reflected
              on this page with a revised date. Questions: {CONTACT.phoneDisplay} or{" "}
              <a className="font-medium text-indigo underline" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
