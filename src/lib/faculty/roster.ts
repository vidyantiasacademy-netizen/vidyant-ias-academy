import { toPlainText } from "next-sanity";

import { projectedImageUrl } from "@/lib/sanity/image";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getFaculty } from "@/lib/sanity/queries";
import type { FacultyMember, PortableTextBlocks } from "@/lib/sanity/types";
import type { Faculty, FacultyArea } from "@/types";

/**
 * The faculty list the public site renders, read from Sanity.
 *
 * Mapping happens here rather than in the components so that `FacultyCard`,
 * `FacultyFilters` and the profile page keep taking one `Faculty` shape and do
 * not need to know the CMS projection.
 */

/**
 * `subject.paper` → the filter chips on `/faculty`.
 *
 * GS-IV is both: it is a GS paper, and Ethics is how students look for it.
 */
const AREA_BY_PAPER: Record<string, FacultyArea[]> = {
  gs1: ["gs"],
  gs2: ["gs"],
  gs3: ["gs"],
  gs4: ["gs", "ethics"],
  essay: ["essay"],
  optional: ["optional"],
  csat: ["csat"],
};

function areasFromPapers(papers: (string | null)[]): FacultyArea[] {
  const areas = new Set<FacultyArea>();

  for (const paper of papers) {
    if (!paper) continue;

    for (const area of AREA_BY_PAPER[paper] ?? []) areas.add(area);
  }

  return [...areas];
}

/**
 * `PortableTextBlocks` is `unknown[]` in `lib/sanity/types.ts` — the projections
 * do not describe block contents. Narrowed here rather than widening that type,
 * so the cast stays in one place for `sanity typegen` to remove later.
 */
function plainText(blocks: PortableTextBlocks): string {
  return toPlainText(blocks as Parameters<typeof toPlainText>[0]).trim();
}

/**
 * Sanity profile → the `Faculty` shape the UI renders. Every consumer treats an
 * empty value as "nothing to show" instead of rendering a blank heading.
 */
export function toFacultyProfile(member: FacultyMember): Faculty {
  return {
    id: member._id,
    slug: member.slug,
    name: member.name,
    subject: member.designation,
    areas: areasFromPapers(member.papers ?? []),
    experience: member.experience ?? "",
    specialisations: member.subjects ?? [],
    bio: member.bio ? plainText(member.bio) : "",
    qualifications: member.achievements ?? [],
    teachingPhilosophy: member.teachingPhilosophy ?? "",
    image: projectedImageUrl(member.photo, { width: 800, height: 1000 }),
    isPlaceholder: member.profilePending,
    status: "published",
  };
}

/** Published profiles in `locale`, or in English where a translation is missing. */
export async function getFacultyRoster(locale: Locale = DEFAULT_LOCALE): Promise<Faculty[]> {
  return (await getFaculty(locale)).filter((member) => member.slug).map(toFacultyProfile);
}

export async function getFacultyProfile(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Faculty | null> {
  const roster = await getFacultyRoster(locale);

  return roster.find((member) => member.slug === slug) ?? null;
}
