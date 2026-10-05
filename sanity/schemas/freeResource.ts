import { defineField, defineType } from "sanity";

/**
 * Free downloads: syllabus PDFs, booklists, PYQ compilations.
 *
 * Deliberately on Sanity's CDN rather than Firebase Storage. These files are
 * meant to be shared, and serving them from the CMS keeps them out of the
 * bucket whose rules assume "nothing in here is public". Gated material (where
 * the form is the point) uses `file: null` and the existing
 * `ResourceRequestForm` flow instead.
 */
export const freeResource = defineType({
  name: "freeResource",
  title: "Free resource",
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
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
      name: "pages",
      type: "number",
      description: "Shown on the card so a student knows what they are downloading.",
    }),
    defineField({ name: "order", type: "number", title: "Sort order" }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});
