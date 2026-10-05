import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
}

/** Shared inner-page hero: ivory band, breadcrumb trail, headline and lede. */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: PageHeroProps) {
  return (
    <section className="border-b border-line bg-paper">
      <Container size="wide" className="py-12 sm:py-16 lg:py-20">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="mb-7" /> : null}
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="mt-4 max-w-3xl text-h1 font-semibold text-indigo lg:text-h1-lg">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-body text-ink-secondary sm:text-body-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </section>
  );
}
