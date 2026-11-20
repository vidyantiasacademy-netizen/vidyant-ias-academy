import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getLocale } from "@/i18n/server";
import { breadcrumbSchema, jsonLd } from "@/lib/seo/structured-data";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
  /**
   * Right-hand column content, e.g. a faculty portrait: above the headline on
   * phones, beside it from `lg`.
   */
  media?: ReactNode;
}

/**
 * Shared inner-page hero, Swiss: white field, 12-column grid, headline flush
 * left in the first 8 columns, optional media in the remaining 4 from `lg`.
 * A hard indigo rule closes the band.
 *
 * The breadcrumb trail is also emitted as BreadcrumbList JSON-LD, so every
 * inner page gets breadcrumb markup without wiring it per page.
 */
export async function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  media,
}: PageHeroProps) {
  const locale = breadcrumbs ? await getLocale() : null;

  return (
    // The first section after the hero starts close under its rule, so content
    // shows above the fold instead of a second band of padding.
    <section className="relative border-b-2 border-indigo bg-white [&+section]:pt-8 sm:[&+section]:pt-10 lg:[&+section]:pt-12">
      <Container size="wide" className="relative py-8 sm:py-10 lg:py-12">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="mb-5" /> : null}
        {breadcrumbs && locale ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema(breadcrumbs, null, locale)) }}
          />
        ) : null}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-8">
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            <h1 className="mt-3 max-w-4xl text-h1 font-bold text-indigo lg:text-h1-lg">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-body text-ink-secondary sm:text-body-lg">
                {description}
              </p>
            ) : null}
            {children ? <div className="mt-6">{children}</div> : null}
          </div>
          {media ? (
            <div className="-order-1 lg:order-none lg:col-span-4 lg:flex lg:items-start lg:justify-end">
              {media}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
