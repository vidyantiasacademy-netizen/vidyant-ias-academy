import { LegalPage } from "@/components/layout/LegalPage";
import { BRAND, CONTACT, ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "Privacy Policy",
  description: `How ${BRAND.name} collects, uses and protects the personal information submitted through this website.`,
  path: ROUTES.privacy,
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description={`What ${BRAND.name} collects through this website, why, and what we will never do with it.`}
      updated="October 2026"
      sections={[
        {
          heading: "What we collect",
          body: (
            <>
              <p>
                Our forms ask for your name, mobile number and email address. Depending on the
                form, we also ask about your college, graduation year, UPSC attempt, target
                attempt, optional subject, preparation level and preferred time to be
                contacted.
              </p>
              <p>
                We record the page the form was submitted from and any campaign parameters in
                the link you arrived through, so we know which of our pages is actually
                helpful. We do not ask for identity documents, financial details or anything
                unnecessary for a counselling conversation.
              </p>
            </>
          ),
        },
        {
          heading: "Why we collect it",
          body: (
            <p>
              To contact you about your enquiry, register you for a demo class or event, send
              you the resource you requested, and answer questions about our programs. We do
              not sell, rent or share your details with other coaching institutes,
              advertisers or data brokers.
            </p>
          ),
        },
        {
          heading: "How it is stored",
          body: (
            <p>
              Submissions are handled by our own server and passed to the systems our academic
              team uses to follow up. Access is limited to staff who need it for admissions or
              academic support. We keep enquiry records only as long as they are useful for
              that purpose.
            </p>
          ),
        },
        {
          heading: "Analytics and cookies",
          body: (
            <>
              <p>
                We measure how the site is used — pages viewed, buttons clicked, forms
                completed — to improve it. We use Google Analytics for visit and conversion
                counts, and Microsoft Clarity for heatmaps and anonymised session recordings
                that show where a page is confusing. Both set cookies to tell one visit from
                the next.
              </p>
              <p>
                Clarity masks what you type into forms, so your name, phone number and email
                are not captured in a recording. Neither tool is used on the student portal
                or during a test. This site sets no advertising cookies, and you can block
                analytics cookies in your browser without losing access to anything here.
              </p>
            </>
          ),
        },
        {
          heading: "Your choices",
          body: (
            <p>
              You can ask us to stop contacting you, correct your details, or delete your
              enquiry record at any time. Write to{" "}
              <a className="font-medium text-indigo underline" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>{" "}
              and we will act on it.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              {BRAND.name}, {CONTACT.addressLines.join(", ")}. Phone {CONTACT.phoneDisplay}.
              Email{" "}
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
