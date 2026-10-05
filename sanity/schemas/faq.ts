import { defineField, defineType } from "sanity";

/** FAQs. Rendered on `/faq`, on course pages, and as `FAQPage` JSON-LD. */
export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
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
    defineField({ name: "order", type: "number", title: "Sort order" }),
  ],
  preview: { select: { title: "question" } },
});
