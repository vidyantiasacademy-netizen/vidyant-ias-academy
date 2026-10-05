import { defineField, defineType } from "sanity";

/**
 * Shared taxonomies.
 *
 * Categories, subjects and tags are documents rather than free-text strings so
 * that renaming "Polity" to "Polity & Governance" updates every blog post and
 * current-affairs article at once, instead of leaving two spellings in the
 * filters forever.
 */

const titleAndSlug = [
  defineField({
    name: "title",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "slug",
    type: "slug",
    options: { source: "title", maxLength: 60 },
    validation: (rule) => rule.required(),
  }),
];

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    ...titleAndSlug,
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({
      name: "order",
      type: "number",
      title: "Sort order",
      description: "Lower numbers appear first.",
    }),
  ],
});

/** UPSC subjects — used by faculty, current affairs and the question bank. */
export const subject = defineType({
  name: "subject",
  title: "Subject",
  type: "document",
  fields: [
    ...titleAndSlug,
    defineField({
      name: "paper",
      type: "string",
      title: "Paper",
      options: {
        list: [
          { title: "GS Paper I", value: "gs1" },
          { title: "GS Paper II", value: "gs2" },
          { title: "GS Paper III", value: "gs3" },
          { title: "GS Paper IV", value: "gs4" },
          { title: "Essay", value: "essay" },
          { title: "Optional", value: "optional" },
          { title: "CSAT", value: "csat" },
        ],
      },
    }),
  ],
});

export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: titleAndSlug,
});

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "designation", type: "string" }),
    defineField({
      name: "photo",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", title: "Alt text" })],
    }),
    defineField({ name: "bio", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "name", subtitle: "designation", media: "photo" } },
});
