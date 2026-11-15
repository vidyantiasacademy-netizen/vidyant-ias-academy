import { defineArrayMember, defineField, defineType } from "sanity";

import { isUniquePerLanguage, languageField } from "./i18n";

/**
 * Notes, subject by subject, for any aspirant: each one is a PDF to
 * download. The editor uploads the PDF and fills in details about it (title,
 * subject, stages, summary, revised date); there is no text body to write. `/notes` lists them; `/notes/<slug>` is the note's download page
 * (summary, page count, size), the link a student shares.
 *
 * Public means public: the PDF is served from Sanity's world-readable CDN, so
 * nothing paid or enrolled-only belongs here (lesson notes for enrolled
 * students live in Firebase Storage behind a signed URL instead).
 */
export const studyNote = defineType({
  name: "studyNote",
  title: "Note",
  type: "document",
  fields: [
    languageField,
    defineField({
      name: "file",
      type: "file",
      title: "PDF",
      description:
        "Upload the note as a PDF. The VidyantIAS watermark is added on download, so upload it plain. Keep it under ~5 MB: students are often on mobile data. Public once published.",
      options: { accept: "application/pdf" },
      validation: (rule) => rule.required().assetRequired(),
    }),
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
      name: "pages",
      type: "number",
      description: "Optional. PDF page count, shown before download.",
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
