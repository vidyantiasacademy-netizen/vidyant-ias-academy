import { Compass } from "lucide-react";

import { SiteChrome } from "@/components/layout/SiteChrome";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getDictionary } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";

/**
 * Renders for `notFound()` anywhere under `[lang]` and, via the `[...rest]`
 * catch-all, for every unmatched URL. It sits outside the `(marketing)`
 * layout, so it brings its own chrome.
 */
export default async function NotFound() {
  const dict = await getDictionary();

  return (
    <SiteChrome>
      <Container className="flex flex-col items-start py-20 sm:py-28">
        <span className="flex size-12 items-center justify-center border-2 border-indigo bg-white text-indigo">
          <Compass aria-hidden className="size-6" />
        </span>
        <p className="mt-7 text-eyebrow font-semibold uppercase text-kesar-600">
          404
        </p>
        <h1 className="mt-3 text-h1 font-bold lg:text-h1-lg">{dict.notFound.title}</h1>
        <p className="mt-4 max-w-xl text-body text-ink-secondary sm:text-body-lg">
          {dict.notFound.body}
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={ROUTES.home} variant="primary" size="lg">
            {dict.notFound.home}
          </ButtonLink>
          <ButtonLink href={ROUTES.courses} variant="secondary" size="lg">
            {dict.cta.courses}
          </ButtonLink>
        </div>
      </Container>
    </SiteChrome>
  );
}
