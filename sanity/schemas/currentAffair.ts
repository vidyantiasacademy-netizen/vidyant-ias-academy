import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Daily current affairs.
 *
 * `importance` and `relatedSubjects` exist so an aspirant can triage a week's
 * backlog — and so the future AI revision feature can pick what to resurface
 * without re-reading the prose.
 */
export const currentAffair = defineType({
  name: "currentAffair",
  title: "Current affair",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      type: "date",
      description: "The date of the news, not the date it was written up.",
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "importance",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Must read", value: "must-read" },
          { title: "Important", value: "important" },
          { title: "Background", value: "background" },
        ],
      },
      initialValue: "important",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      title: "Prelims-ready summary",
      description: "The two-line version a student can revise from.",
    }),
    defineField({
      name: "content",
      type: "blockContent",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "relatedSubjects",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "subject" }] })],
      description: "Which GS paper this feeds into. Drives revision grouping.",
    }),
    defineField({
      name: "sources",
      type: "array",
      of: [defineArrayMember({ type: "source" })],
      description: "Cite every claim. Students are told to verify.",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })],
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  orderings: [
    { title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", date: "date", importance: "importance" },
    prepare: ({ title, date, importance }) => ({
      title,
      subtitle: `${date ?? "No date"} · ${importance ?? ""}`,
    }),
  },
});
