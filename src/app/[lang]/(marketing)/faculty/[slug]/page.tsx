import { BookOpen, GraduationCap, Quote } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { CourseCard } from "@/components/courses/CourseCard";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import { getFacultyProfile, getFacultyRoster } from "@/lib/faculty/roster";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  const roster = await getFacultyRoster();

  return roster.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/faculty/[slug]">) {
  const { slug } = await params;
  const member = await getFacultyProfile(slug, await getLocale());

  if (!member) {
    return pageMetadata({
      title: "Faculty profile not found",
      description: "This profile is no longer listed.",
      path: `${ROUTES.faculty}/${slug}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: `${member.name} — ${member.subject}`,
    // A CMS profile can be published before its bio is written.
    description: member.bio || `${member.name} teaches ${member.subject} at vidyantIAS.`,
    path: `${ROUTES.faculty}/${member.slug}`,
    // Placeholder profiles are kept out of the index until they are verified.
    noIndex: member.isPlaceholder,
  });
}

export default async function FacultyProfilePage({ params }: PageProps<"/[lang]/faculty/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const member = await getFacultyProfile(slug, locale);

  if (!member || member.status !== "published") notFound();

  // The link is set on the Sanity course document.
  const courses = (await getCourseCatalogue(locale)).filter((course) =>
    course.faculty.some((teacher) => teacher.slug === member.slug),
  );

  return (
    <>
      <PageHero
        eyebrow={member.subject}
        title={member.name}
        description={member.bio}
        media={
          member.image ? (
            <div className="relative aspect-4/5 w-36 overflow-hidden rounded-2xl border border-line bg-paper sm:w-44 lg:w-full lg:max-w-72">
              <Image
                src={member.image}
                alt={`${member.name}, ${member.subject} at vidyantIAS`}
                fill
                priority
                sizes="(min-width: 1024px) 288px, (min-width: 640px) 176px, 144px"
                className="object-cover"
              />
            </div>
          ) : undefined
        }
        breadcrumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "Faculty", href: ROUTES.faculty },
          { label: member.name },
        ]}
      >
        {member.specialisations.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {member.specialisations.map((item) => (
              <li key={item}>
                <Badge tone="kesar">{item}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </PageHero>

      <Section containerSize="wide">
        <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-14">
          <aside className="flex flex-col gap-4">
            <Card tone="paper">
              <GraduationCap aria-hidden className="size-5 text-kesar-600" />
              {member.experience ? (
                <>
                  <h2 className="mt-4 text-h4 font-bold">Experience</h2>
                  <p className="mt-2.5 text-small text-ink-secondary">{member.experience}</p>
                </>
              ) : null}

              {member.qualifications.length > 0 ? (
                <>
                  <h2 className="mt-6 text-h4 font-bold">Qualifications</h2>
                  <ul className="mt-2.5 space-y-2 text-small text-ink-secondary">
                    {member.qualifications.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </Card>

            {member.isPlaceholder ? (
              <Card>
                <Badge tone="neutral">Profile pending</Badge>
                <p className="mt-4 text-small text-ink-secondary">
                  This profile describes a teaching role. Name, qualifications and experience
                  are published once vidyantIAS has verified them.
                </p>
              </Card>
            ) : null}
          </aside>

          <div>
            {member.teachingPhilosophy ? (
              <>
                <SectionHeader
                  eyebrow="Teaching philosophy"
                  title="How this subject is taught"
                />
                <blockquote className="mt-6 border-l-2 border-indigo pl-6">
                  <Quote aria-hidden className="size-6 text-kesar/70" />
                  <p className="mt-3 text-body text-ink sm:text-body-lg">
                    {member.teachingPhilosophy}
                  </p>
                </blockquote>
              </>
            ) : null}

            {member.specialisations.length > 0 ? (
              <>
                <h2 className="mt-10 text-h4 font-bold">Specialises in</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {member.specialisations.map((item) => (
                    <li key={item}>
                      <Badge tone="neutral">{item}</Badge>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <Card className="mt-10 flex items-start gap-4">
              <BookOpen aria-hidden className="mt-0.5 size-5 shrink-0 text-kesar-600" />
              <p className="text-small text-ink-secondary">
                Demo lectures, published articles and student feedback for this faculty member
                will appear here as they are recorded and consented to. We do not publish
                clips or quotes without permission.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {courses.length > 0 ? (
        <Section tone="paper" containerSize="wide">
          <SectionHeader eyebrow="Programs" title="Where you will learn from this faculty" />
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-5">
            {courses.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CTASection
        title="Sit in on a class before you decide."
        description="A free demo class shows you the teaching, the pace and the level of practice expected."
        location={`faculty-${member.id}-final`}
      />
    </>
  );
}
