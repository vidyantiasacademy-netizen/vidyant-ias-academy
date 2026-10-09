import { defineArrayMember, defineField, defineType } from "sanity";

import { languageField } from "./i18n";

/** FAQs. Rendered on `/faq`, on course pages, and as `FAQPage` JSON-LD. */
export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    languageField,
    defineField({
      name: "question",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "answer",
      type: "blockContent",
      description:
        "Keep it answerable in three sentences. Long answers belong in a blog post.",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "category", type: "reference", to: [{ type: "category" }] }),
    defineField({
      name: "topics",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      description: "Search keywords, e.g. \"fees\", \"mode\", \"mentorship\".",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      title: "Show on the homepage",
      initialValue: false,
    }),
    defineField({ name: "order", type: "number", title: "Sort order" }),
  ],
  preview: { select: { title: "question" } },
});
