import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/forms/SignInForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { homeRouteFor } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/server";
import { ROUTES } from "@/lib/constants/site";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { pageMetadata } from "@/lib/seo/metadata";
import { redirectTargetSchema } from "@/lib/validation/auth";

export const generateMetadata = () => pageMetadata({
  title: "Student Login",
  description:
    "Sign in to the vidyantIAS student platform for classes, test performance, evaluated answers and mentorship notes.",
  path: ROUTES.login,
  noIndex: true,
});

/**
 * Sign-in for students and staff.
 *
 * The `?next=` parameter is validated here, on the server, rather than read
 * from the URL in the client component: `redirectTargetSchema` rejects anything
 * that is not a single-slash relative path, so `?next=https://evil.example`
 * cannot turn this page into an open redirect.
 */
export default async function LoginPage({ searchParams }: PageProps<"/[lang]/login">) {
  const { next } = await searchParams;

  const requested = typeof next === "string" ? next : null;
  const nextPath =
    requested && redirectTargetSchema.safeParse(requested).success ? requested : null;

  // Already signed in — send them where they belong. The proxy cannot do this
  // part, because it never verifies the cookie and so never knows the role.
  const user = await getCurrentUser();
  if (user) redirect(nextPath ?? homeRouteFor(user.role));

  return (
    <>
      <PageHero
        eyebrow="Student Platform"
        title="Sign in to your student portal."
        description="Classes, test performance, evaluated answers and mentorship notes, in one place."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Student Login" }]}
      />

      <Section containerSize="narrow">
        {isFirebaseConfigured() ? (
          <SignInForm nextPath={nextPath} />
        ) : (
          <Card tone="paper" padding="lg">
            <span className="flex size-11 shrink-0 items-center justify-center border border-line bg-white text-kesar-600">
              <LockKeyhole aria-hidden className="size-5" />
            </span>
            <h2 className="mt-5 text-h3 font-bold">Sign-in is not available yet.</h2>
            <p className="mt-3 text-body text-ink-secondary">
              The student platform is being set up. Your batch coordinator shares class
              schedules, test papers and evaluated answers directly in the meantime.
            </p>
          </Card>
        )}

        <Card tone="paper" padding="lg" className="mt-8">
          <h2 className="text-h3 font-bold">Don&apos;t have an account yet?</h2>
          <p className="mt-3 text-body text-ink-secondary">
            Classes, tests and study material open up once your admission is confirmed and
            the centre activates your enrolment. If you have enrolled and not received your
            details, contact the academic team.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={ROUTES.contact} variant="primary">
              Contact the centre
            </ButtonLink>
            <ButtonLink href={ROUTES.counselling} variant="secondary">
              Book Free Counselling
            </ButtonLink>
          </div>
        </Card>
      </Section>
    </>
  );
}
