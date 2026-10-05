import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Course *marketing* content.
 *
 * Fees, seats, batch dates, enrollment and access all live in Firestore
 * (`courses/{courseId}`, `batches`, `enrollments`) — a CMS is the wrong place
 * for a number that decides whether someone has paid. This document holds the
 * prose and imagery the public pages render, joined by slug.
 */
export const course = defineType({
  name: "course",
  title: "Course (content)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      description: "Must match `courses/{courseId}.sanitySlug` in Firestore.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      description: "The one-paragraph pitch used on cards and the brochure.",
    }),
    defineField({
      name: "heroImage",
      type: "image",
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
      name: "highlights",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "Four to six short lines. What the programme actually includes.",
    }),
    defineField({
      name: "curriculum",
      type: "array",
      of: [defineArrayMember({ type: "curriculumModule" })],
    }),
    defineField({ name: "body", type: "blockContent", title: "Full description" }),
    defineField({
      name: "order",
      type: "number",
      title: "Sort order",
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: { select: { title: "title", media: "heroImage" } },
});
