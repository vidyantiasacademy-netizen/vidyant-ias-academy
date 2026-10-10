import type { ReactNode } from "react";

import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants/site";

interface LegalSection {
  heading: string;
  body: ReactNode;
}

/**
 * Shared shell for the legal pages so the three documents stay visually and
 * structurally identical.
 */
export function LegalPage({
  title,
  description,
  updated,
  sections,
}: {
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        description={description}
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: title }]}
      />

      <Section containerSize="narrow">
        <p className="text-small text-ink-muted">Last updated: {updated}</p>

        <Card tone="paper" className="mt-6">
          <p className="text-small text-ink-secondary">
            This document is being reviewed by the institute&apos;s legal advisor before
            launch. It describes how vidyantIAS currently operates; if any clause conflicts
            with what the academic team tells you in writing, the written commitment applies.
          </p>
        </Card>

        <div className="mt-10 space-y-10">
          {sections.map((section, index) => (
            <section key={section.heading} className="border-t-2 border-indigo pt-5">
              <h2 className="flex items-baseline gap-4 text-h3 font-bold tracking-tight">
                <span aria-hidden className="text-small font-bold tabular-nums text-indigo">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-body text-ink-secondary">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}
