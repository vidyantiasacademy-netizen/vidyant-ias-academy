import { Compass } from "lucide-react";

import { SiteChrome } from "@/components/layout/SiteChrome";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants/site";

/**
 * Catches every unmatched URL in the app, so it renders inside the root layout
 * rather than the `(marketing)` one and brings its own chrome.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <Container className="flex flex-col items-start py-20 sm:py-28">
        <span className="flex size-12 items-center justify-center rounded-full bg-paper text-kesar-600">
          <Compass aria-hidden className="size-6" />
        </span>
        <p className="mt-7 text-eyebrow font-semibold uppercase text-kesar-600">
          404
        </p>
        <h1 className="mt-3 text-h1 font-semibold lg:text-h1-lg">Lost your way?</h1>
        <p className="mt-4 max-w-xl text-body text-ink-secondary sm:text-body-lg">
          Let&apos;s get you back to your UPSC preparation.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={ROUTES.home} variant="primary" size="lg">
            Back to Home
          </ButtonLink>
          <ButtonLink href={ROUTES.courses} variant="secondary" size="lg">
            Explore Courses
          </ButtonLink>
        </div>
      </Container>
    </SiteChrome>
  );
}
