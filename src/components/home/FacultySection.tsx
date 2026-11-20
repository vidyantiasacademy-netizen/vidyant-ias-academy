import { ArrowRight, GraduationCap } from "lucide-react";
import Image from "next/image";

import Link from "@/i18n/Link";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ROUTES } from "@/lib/constants/site";
import { getLocale } from "@/i18n/server";
import { getFacultyRoster } from "@/lib/faculty/roster";
import type { Faculty } from "@/types";

/**
 * Homepage teaser card: a round portrait above name and subjects. Lighter than
 * the full 4:5 portrait cards on `/faculty`, so four fit in one band.
 */
function FacultyTeaserCard({ member }: { member: Faculty }) {
  return (
    <Link
      href={`/faculty/${member.slug}`}
      className="group flex h-full flex-col items-center rounded-2xl border border-line bg-white px-4 py-6 text-center transition-colors duration-150 ease-brand hover:border-indigo sm:px-6 sm:py-8"
    >
      <span className="relative size-24 shrink-0 overflow-hidden rounded-full border-2 border-paper-200 bg-paper-200 sm:size-32 lg:size-36">
        {member.image ? (
          <Image
            src={member.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 144px, (min-width: 640px) 128px, 96px"
            className="object-cover object-top"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <GraduationCap aria-hidden className="size-8 text-indigo/50" />
          </span>
        )}
      </span>

      <span className="mt-4 text-body font-bold text-ink group-hover:text-indigo sm:mt-5 sm:text-h4">
        {member.name}
      </span>
      <span className="mt-1.5 line-clamp-3 text-eyebrow font-semibold uppercase tracking-[0.08em] text-kesar-600">
        {member.specialisations.length > 0 ? member.specialisations.join(" • ") : member.subject}
      </span>
      {member.bio ? (
        <span className="mt-3 line-clamp-4 text-small text-ink-secondary sm:line-clamp-3">
          {member.bio}
        </span>
      ) : null}
      {member.isPlaceholder ? (
        <Badge tone="kesar" className="mt-3">
          Profile pending
        </Badge>
      ) : null}

      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-small font-semibold text-indigo">
        View Profile
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}

export async function FacultySection() {
  const members = (await getFacultyRoster(await getLocale())).slice(0, 4);
  const awaitingProfiles = members.some((member) => member.isPlaceholder);

  return (
    <Section tone="paper" id="faculty" containerSize="wide">
      <SectionHeader
        eyebrow="Faculty"
        title={
          <>
            Learn from people who <em>understand the examination.</em>
          </>
        }
        description="Teaching at vidyantIAS is handled by subject faculty who stay close to how the paper is set — and who also read and evaluate the answers you write."
        action={
          <ButtonLink href={ROUTES.faculty} variant="secondary">
            Meet Our Faculty
          </ButtonLink>
        }
      />

      <ul className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-9 lg:grid-cols-4 lg:gap-5">
        {members.map((member) => (
          <li key={member.id}>
            <FacultyTeaserCard member={member} />
          </li>
        ))}
      </ul>

      {awaitingProfiles ? (
        <p className="mt-6 text-small text-ink-muted">
          Faculty names, qualifications and photographs are published once verified. Ask for
          the current teaching panel for your batch during counselling.
        </p>
      ) : null}
    </Section>
  );
}
