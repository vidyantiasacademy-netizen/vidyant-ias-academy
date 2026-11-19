import { defineArrayMember, defineField, defineType } from "sanity";

import { isUniquePerLanguage, languageField } from "./i18n";

/**
 * Study material: free reading (syllabus, booklists, roadmaps, PYQ strategy)
 * and, when `price` is set, paid material sold on the site.
 *
 * A free resource is read on the site: the editor writes it in `content` and
 * `/resources/<slug>` renders it as a page, the link a student shares. A PDF
 * is optional — when attached, the page offers it as a printable copy. A
 * resource with neither content nor PDF goes through the request form.
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
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      description: "One or two lines on the card and under the page title.",
    }),
    defineField({
      name: "content",
      type: "blockContent",
      title: "Page content",
      description:
        "What the student reads on /resources/<slug>: headings, lists, quotes and links. Public once published. Hidden for priced resources — their material is never shown on the site.",
      hidden: ({ document }) => typeof document?.price === "number" && document.price > 0,
    }),
    defineField({
      name: "file",
      type: "file",
      title: "PDF (optional)",
      description:
        "A printable copy, offered as a download on the resource page. Leave empty if the page content is enough. With neither content nor PDF, the resource goes through the request form.",
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
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});
