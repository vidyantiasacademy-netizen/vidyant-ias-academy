import { defineArrayMember, defineField, defineType } from "sanity";

import { isUniquePerLanguage, languageField } from "./i18n";

/**
 * Course *marketing* content.
 *
 * Fees, seats, batch dates, enrollment and access all live in Firestore
 * (`courses/{courseId}`, `batches`, `enrollments`) — a CMS is the wrong place
 * for a number that decides whether someone has paid. This document holds the
 * prose and imagery the public pages render, joined by slug.
 *
 * So is the programme's *category* and *delivery mode*: the site filters and
 * the enrolment desk both reason about them, so `courses/{courseId}` owns them
 * and this document only describes. A course appears on the site when its
 * Firestore record is published *and* a document here carries its
 * `sanitySlug` — see `src/lib/courses/catalogue.ts`.
 */
export const course = defineType({
  name: "course",
  title: "Course (content)",
  type: "document",
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "programme", title: "Programme" },
    { name: "card", title: "Programme card" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    languageField,
    defineField({
      name: "title",
      type: "string",
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "overview",
      options: { source: "title", maxLength: 96, isUnique: isUniquePerLanguage },
      description: "Must match `courses/{courseId}.sanitySlug` in Firestore.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "reference",
      group: "overview",
      to: [{ type: "category" }],
      description:
        "Optional editorial grouping. The filter on /courses uses the category set in the admin panel.",
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      group: "overview",
      description: "The one-paragraph pitch used on cards and the brochure.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      type: "blockContent",
      title: "Full description",
      group: "overview",
      description: "The overview paragraph at the top of the course page.",
    }),
    defineField({
      name: "heroImage",
      type: "image",
      group: "overview",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt text",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "card",
      type: "object",
      title: "Programme card",
      group: "card",
      description:
        "Optional lines for the homepage programme card. Anything left blank falls back to the course's own data.",
      fields: [
        defineField({
          name: "tagline",
          type: "string",
          description: "One short line under the title, e.g. “Stay Updated. Stay Ahead.”",
          validation: (rule) => rule.max(70),
        }),
        defineField({
          name: "badge",
          type: "string",
          description: "A short badge beside the title, e.g. “2027”. Leave blank for none.",
          validation: (rule) => rule.max(12),
        }),
        defineField({
          name: "format",
          type: "string",
          description:
            "Replaces the delivery-mode pill, e.g. “GS Sectional + Full Length Tests”. Separate parts with “|”.",
          validation: (rule) => rule.max(48),
        }),
        defineField({
          name: "keyFact",
          type: "string",
          description: "The outlined pill, e.g. “Dec – Apr 2027”, “40 Tests”. Blank shows the module count.",
          validation: (rule) => rule.max(24),
        }),
      ],
    }),
    defineField({
      name: "highlights",
      type: "array",
      group: "programme",
      of: [defineArrayMember({ type: "string" })],
      description: "Four to six short lines. What the programme actually includes.",
    }),
    defineField({
      name: "audience",
      type: "array",
      title: "Who is this for?",
      group: "programme",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "outcomes",
      type: "array",
      title: "What you'll learn",
      group: "programme",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "curriculum",
      type: "array",
      group: "programme",
      of: [defineArrayMember({ type: "curriculumModule" })],
    }),
    defineField({
      name: "durationNote",
      type: "string",
      title: "Duration (text)",
      group: "programme",
      description:
        "Shown only when the admin panel has no duration in months, e.g. \"Test calendar published per cycle\".",
    }),
    defineField({
      name: "schedule",
      type: "string",
      group: "programme",
      description: "e.g. \"Weekday batches, with weekend options subject to availability\".",
    }),
    defineField({ name: "tests", type: "text", rows: 3, group: "programme" }),
    defineField({ name: "mentorship", type: "text", rows: 3, group: "programme" }),
    defineField({
      name: "studyMaterial",
      type: "array",
      title: "Study material",
      group: "programme",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "faculty",
      type: "array",
      group: "programme",
      of: [defineArrayMember({ type: "reference", to: [{ type: "faculty" }] })],
      description: "Published faculty profiles who teach this programme.",
    }),
    defineField({
      name: "order",
      type: "number",
      title: "Sort order",
      group: "overview",
      description: "Lower numbers appear first on /courses.",
    }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  orderings: [{ title: "Sort order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "slug.current", media: "heroImage" } },
});
