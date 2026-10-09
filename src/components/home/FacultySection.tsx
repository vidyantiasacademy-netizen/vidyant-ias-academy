import { FacultyCard } from "@/components/faculty/FacultyCard";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { railItem, railList } from "@/components/ui/rail";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/constants/site";
import { getLocale } from "@/i18n/server";
import { getFacultyRoster } from "@/lib/faculty/roster";

export async function FacultySection() {
  const members = (await getFacultyRoster(await getLocale())).slice(0, 4);
  const awaitingProfiles = members.some((member) => member.isPlaceholder);

  return (
    <Section tone="paper" id="faculty" containerSize="wide">
      <SectionHeader
        eyebrow="Faculty"
        title="Learn from people who understand the examination."
        description="Teaching at vidyantIAS is handled by subject faculty who stay close to how the paper is set — and who also read and evaluate the answers you write."
        action={
          <ButtonLink href={ROUTES.faculty} variant="secondary">
            Meet Our Faculty
          </ButtonLink>
        }
      />

      <ul className={cn(railList[4], "mt-7 lg:mt-9")}>
        {members.map((member) => (
          <li key={member.id} className={railItem}>
            <FacultyCard member={member} />
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
