import { LegalPage } from "@/components/layout/LegalPage";
import { BRAND, CONTACT, ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Refund Policy",
  description: `How fee refunds and transfers work at ${BRAND.name}, and how to raise a request.`,
  path: ROUTES.refund,
});

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      description="How refunds and batch transfers are handled, stated before you pay rather than after."
      updated="September 2026"
      sections={[
        {
          heading: "Before you pay",
          body: (
            <p>
              The applicable refund terms for your program and batch are shared in writing at
              the time of enrolment, along with the fee and any instalment schedule. Ask for
              them if they are not handed to you — they should never be a surprise later.
            </p>
          ),
        },
        {
          heading: "Requesting a refund",
          body: (
            <p>
              Write to{" "}
              <a className="font-medium text-indigo underline" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>{" "}
              from the email address used at enrolment, stating your name, program, batch and
              reason. We acknowledge every request and tell you the outcome and timeline in
              writing.
            </p>
          ),
        },
        {
          heading: "Batch transfers",
          body: (
            <p>
              Where a genuine reason prevents you from continuing — a medical situation, a job
              posting, an examination clash — we will first try to move you to a later batch
              or the online mode rather than end your preparation.
            </p>
          ),
        },
        {
          heading: "Material and access",
          body: (
            <p>
              Study material already issued and recordings already accessed are accounted for
              separately from tuition, because they cannot be returned. The written terms you
              receive at enrolment set out how.
            </p>
          ),
        },
        {
          heading: "Questions",
          body: (
            <p>
              {BRAND.name}, {CONTACT.addressLines.join(", ")}. Phone {CONTACT.phoneDisplay}.
            </p>
          ),
        },
      ]}
    />
  );
}
