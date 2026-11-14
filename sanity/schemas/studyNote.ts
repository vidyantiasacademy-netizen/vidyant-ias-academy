import { defineArrayMember, defineField, defineType } from "sanity";

import { isUniquePerLanguage, languageField } from "./i18n";

/**
 * Free study notes, subject by subject, for any aspirant — readable on the
 * site (`/notes/<slug>`) and, when a PDF is attached, downloadable.
 *
 * A note needs at least one of the two: written content or a PDF. Both is
 * best — the page is searchable and readable on a phone, and the PDF is what
 * a student prints.
 *
 * Free means public: the PDF is served from Sanity's world-readable CDN, so
 * nothing paid or enrolled-only belongs here (lesson notes for enrolled
 * students live in Firebase Storage behind a signed URL instead).
 */
export const studyNote = defineType({
  name: "studyNote",
  title: "Study note",
  type: "document",
  fields: [
    languageField,
    defineField({
      name: "title",
      type: "string",
      description: "What the note covers, as a student would search for it: “Fundamental Rights — Articles 12 to 35”.",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96, isUnique: isUniquePerLanguage },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subject",
      type: "reference",
      to: [{ type: "subject" }],
      description: "Drives the subject filter on /notes.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stages",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: ["Prelims", "Mains", "Essay", "Interview"].map((value) => ({ title: value, value })),
      },
      description: "Which stages of the examination this note is written for.",
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      description: "One or two lines on the card: what is covered and why it matters.",
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "content",
      type: "blockContent",
      description: "The note itself, read on the page. Optional if a PDF is attached.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { file?: { asset?: unknown } } | undefined;
          const hasContent = Array.isArray(value) && value.length > 0;
          return hasContent || doc?.file?.asset ? true : "Add the note text, a PDF, or both.";
        }),
    }),
    defineField({
      name: "file",
      type: "file",
      title: "PDF",
      description:
        "Optional download. Keep it under ~5 MB — students are often on mobile data. Public once published.",
      options: { accept: "application/pdf" },
    }),
    defineField({
      name: "pages",
      type: "number",
      description: "PDF page count, shown before download.",
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: "readingMinutes",
      type: "number",
      title: "Reading time (minutes)",
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: "revisedAt",
      type: "date",
      title: "Last revised",
      description: "When the content was last checked. Shown to students, so keep it honest.",
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "order", type: "number", title: "Sort order within the subject" }),
    defineField({ name: "seo", type: "seo" }),
  ],
  orderings: [
    { title: "Recently revised", name: "revisedDesc", by: [{ field: "revisedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", subject: "subject.title", revisedAt: "revisedAt" },
    prepare: ({ title, subject, revisedAt }) => ({
      title,
      subtitle: [subject, revisedAt].filter(Boolean).join(" · "),
    }),
  },
});
