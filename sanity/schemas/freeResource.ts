import { defineArrayMember, defineField, defineType } from "sanity";

import { isUniquePerLanguage, languageField } from "./i18n";

/**
 * Study material: free downloads (syllabus PDFs, booklists, PYQ compilations)
 * and, when `price` is set, paid material sold on the site.
 *
 * Deliberately on Sanity's CDN rather than Firebase Storage. These files are
 * meant to be shared, and serving them from the CMS keeps them out of the
 * bucket whose rules assume "nothing in here is public". Gated material (where
 * the form is the point) uses `file: null` and the existing
 * `ResourceRequestForm` flow instead.
 */
export const freeResource = defineType({
  name: "freeResource",
  title: "Resource",
  type: "document",
  fields: [
    languageField,
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96, isUnique: isUniquePerLanguage },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Optional editorial grouping. The /resources filter uses Tracks.",
    }),
    defineField({
      name: "resourceType",
      type: "string",
      title: "Type",
      options: {
        list: [
          { title: "PDF", value: "pdf" },
          { title: "Guide", value: "guide" },
          { title: "Video", value: "video" },
          { title: "Article", value: "article" },
          { title: "PYQ", value: "pyq" },
          { title: "Current affairs", value: "current-affairs" },
        ],
      },
      initialValue: "pdf",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tracks",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Beginner", value: "beginner" },
          { title: "Prelims", value: "prelims" },
          { title: "Mains", value: "mains" },
          { title: "Optional", value: "optional" },
          { title: "Current affairs", value: "current-affairs" },
        ],
      },
      description: "The /resources filters this resource appears under.",
    }),
    defineField({
      name: "requiresLead",
      type: "boolean",
      title: "Ask for contact details first",
      initialValue: false,
    }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({
      name: "file",
      type: "file",
      title: "PDF",
      description:
        "Leave empty to route the resource through the request form instead of a direct download.",
      options: { accept: "application/pdf" },
    }),
    defineField({
      name: "price",
      type: "number",
      title: "Price (₹)",
      description:
        "Leave empty for free material. A priced resource is sold, never downloaded: keep its PDF out of the File field above (that URL is public) and fulfil the order after payment.",
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "pages",
      type: "number",
      description: "Shown on the card so a student knows what they are downloading.",
    }),
    defineField({ name: "order", type: "number", title: "Sort order" }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});
