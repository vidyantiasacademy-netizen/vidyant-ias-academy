import { UPSC_GUIDES } from "@/data/upsc-guides";
import { BRAND, CONTACT, EXAM_CYCLE, ROUTES, SITE_URL } from "@/lib/constants/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import { getStudyNotes } from "@/lib/sanity/queries";

/**
 * /llms.txt — a plain-Markdown map of the site for AI answer engines
 * (https://llmstxt.org). It says what the institute is in a few factual
 * lines and links the pages worth citing. Only verifiable facts: no results,
 * student counts or rankings (the institute is new; see `src/data/*`).
 *
 * Regenerated hourly, so new courses and notes appear without a deploy.
 */
export const revalidate = 3600;

const url = (path: string) => new URL(path, SITE_URL).toString();

export async function GET() {
  const [courses, notes] = await Promise.all([getCourseCatalogue(), getStudyNotes()]);

  const lines = [
    `# ${BRAND.name}`,
    "",
    `> ${BRAND.name} is a UPSC Civil Services Examination coaching institute in ${CONTACT.addressLocality}, ${CONTACT.addressRegion}, India, preparing aspirants for ${EXAM_CYCLE.label}. Programs cover Foundation, Prelims, Mains and Optional subjects, with a personal mentor, a fixed test calendar and Mains answer evaluation. The site is available in English and Hindi (/hi).`,
    "",
    "## Programs",
    ...courses.map((course) => `- [${course.title}](${url(`${ROUTES.courses}/${course.slug}`)}): ${course.shortDescription}`),
    "",
    "## Free study material",
    `- [UPSC notes](${url(ROUTES.notes)}): subject-wise notes, as PDFs to download.`,
    ...notes.slice(0, 50).map((note) => `  - [${note.title}](${url(`${ROUTES.notes}/${note.slug}`)}): ${note.summary}`),
    `- [Free Prelims mock test](${url(ROUTES.mockTest)}): a timed paper with score, rank and answer key.`,
    `- [Current affairs](${url(ROUTES.currentAffairs)}): developments explained with their UPSC syllabus link.`,
    `- [Free resources](${url(ROUTES.resources)}): syllabus, booklist, PYQ strategy and a study planner.`,
    "",
    "## UPSC exam guide",
    ...UPSC_GUIDES.map((guide) => `- [${guide.title}](${url(`${ROUTES.upscGuide}/${guide.slug}`)})`),
    "",
    "## Institute",
    `- [About](${url(ROUTES.about)})`,
    `- [Faculty](${url(ROUTES.faculty)})`,
    `- [Admissions and batches](${url(ROUTES.enrol)})`,
    `- [Free counselling](${url(ROUTES.counselling)})`,
    `- [Contact and centre address](${url(ROUTES.contact)})`,
    `- [FAQ](${url(ROUTES.faq)})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
