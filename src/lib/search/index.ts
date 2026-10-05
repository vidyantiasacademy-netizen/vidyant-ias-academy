import { publishedBlogPosts } from "@/data/blog";
import { COURSE_CATEGORY_LABELS, publishedCourses } from "@/data/courses";
import { publishedCurrentAffairs } from "@/data/current-affairs";
import { publishedFaculty } from "@/data/faculty";
import { publishedFaqs } from "@/data/faqs";
import { QUIZ_STAGE_LABELS, latestQuizzes } from "@/data/quizzes";
import { publishedResources } from "@/data/resources";
import { ROUTES } from "@/lib/constants/site";

export interface SearchDoc {
  id: string;
  type:
    | "Program"
    | "Faculty"
    | "Resource"
    | "FAQ"
    | "Article"
    | "Current Affairs"
    | "Quiz";
  title: string;
  description: string;
  href: string;
  /** Lower-cased haystack, prepared once at build time. */
  keywords: string;
}

function toDoc(doc: Omit<SearchDoc, "keywords"> & { extra?: string[] }): SearchDoc {
  const { extra = [], ...rest } = doc;
  return {
    ...rest,
    keywords: [rest.title, rest.description, rest.type, ...extra].join(" ").toLowerCase(),
  };
}

/** Flat index over every published content type. Rebuilt whenever data changes. */
export const searchIndex: SearchDoc[] = [
  ...publishedCourses.map((course) =>
    toDoc({
      id: course.id,
      type: "Program",
      title: course.title,
      description: course.shortDescription,
      href: `${ROUTES.courses}/${course.slug}`,
      extra: [
        COURSE_CATEGORY_LABELS[course.category],
        ...course.features,
        ...course.curriculum.flatMap((module) => [module.title, ...module.topics]),
      ],
    }),
  ),
  ...publishedFaculty.map((member) =>
    toDoc({
      id: member.id,
      type: "Faculty",
      title: member.name,
      description: member.subject,
      href: `${ROUTES.faculty}/${member.slug}`,
      extra: member.specialisations,
    }),
  ),
  ...publishedResources.map((resource) =>
    toDoc({
      id: resource.id,
      type: "Resource",
      title: resource.title,
      description: resource.description,
      href: `${ROUTES.resources}#${resource.slug}`,
      extra: resource.tracks,
    }),
  ),
  ...latestQuizzes().map((quiz) =>
    toDoc({
      id: quiz.id,
      type: "Quiz",
      title: quiz.title,
      description: quiz.description,
      href: quiz.href ?? ROUTES.quizzes,
      extra: [QUIZ_STAGE_LABELS[quiz.stage], quiz.subject],
    }),
  ),
  ...publishedFaqs.map((faq) =>
    toDoc({
      id: faq.id,
      type: "FAQ",
      title: faq.question,
      description: faq.answer,
      href: `${ROUTES.faq}#${faq.id}`,
      extra: faq.topics,
    }),
  ),
  ...publishedBlogPosts.map((post) =>
    toDoc({
      id: post.id,
      type: "Article",
      title: post.title,
      description: post.excerpt,
      href: `${ROUTES.blog}/${post.slug}`,
      extra: [post.category],
    }),
  ),
  ...publishedCurrentAffairs.map((item) =>
    toDoc({
      id: item.id,
      type: "Current Affairs",
      title: item.title,
      description: item.whyItMatters,
      href: `${ROUTES.currentAffairs}/${item.slug}`,
      extra: [item.subject, ...item.relevance],
    }),
  ),
];

/** Simple term-match ranking: title hits outrank body hits. */
export function searchDocs(query: string, docs: SearchDoc[] = searchIndex) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return docs
    .map((doc) => {
      const title = doc.title.toLowerCase();
      let score = 0;

      for (const term of terms) {
        if (title.includes(term)) score += 3;
        else if (doc.keywords.includes(term)) score += 1;
      }

      return { doc, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.doc);
}
