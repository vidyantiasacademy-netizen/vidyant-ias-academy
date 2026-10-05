import { toPlainText } from "next-sanity";

import { publishedFaculty } from "@/data/faculty";
import { projectedImageUrl } from "@/lib/sanity/image";
import { getFaculty } from "@/lib/sanity/queries";
import type { FacultyMember, PortableTextBlocks } from "@/lib/sanity/types";
import type { Faculty, FacultyArea } from "@/types";

/**
 * The faculty list the public site renders.
 *
 * Two sources, deliberately: Sanity holds the verified profiles the institute
 * publishes, and `src/data/faculty.ts` holds the placeholder role cards that
 * keep the page from looking empty while profiles are still being verified.
 * Sanity entries come first and win on slug collision, so replacing a
 * placeholder is a matter of publishing a document with the same slug.
 *
 * Mapping happens here rather than in the components so that `FacultyCard`,
 * `FacultyFilters` and the profile page keep taking one `Faculty` shape and do
 * not need to know which source an entry came from.
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
 * Sanity profile → the `Faculty` shape the UI renders.
 *
 * Fields the CMS has no equivalent for are left empty rather than filled with
 * plausible text: `courseIds` (the course→faculty link runs the other way in
 * Sanity) and `teachingPhilosophy`. Every consumer treats an empty value as
 * "nothing to show" instead of rendering a blank heading.
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
    teachingPhilosophy: "",
    courseIds: [],
    image: projectedImageUrl(member.photo, { width: 800, height: 1000 }),
    // A document in Sanity is only reachable here once published, and the
    // institute does not publish a profile it has not verified.
    isPlaceholder: false,
    status: "published",
  };
}

/** Sanity profiles first, then any placeholder whose slug is still unused. */
export async function getFacultyRoster(): Promise<Faculty[]> {
  const published = (await getFaculty())
    .filter((member) => member.slug)
    .map(toFacultyProfile);

  const taken = new Set(published.map((member) => member.slug));

  return [...published, ...publishedFaculty.filter((member) => !taken.has(member.slug))];
}

export async function getFacultyProfile(slug: string): Promise<Faculty | null> {
  const roster = await getFacultyRoster();

  return roster.find((member) => member.slug === slug) ?? null;
}
