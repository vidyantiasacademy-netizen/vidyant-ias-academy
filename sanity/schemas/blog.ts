import { defineArrayMember, defineField, defineType } from "sanity";

import { isUniquePerLanguage, languageField } from "./i18n";

/** Editorial posts: strategy, subject explainers, topper interviews. */
export const blog = defineType({
  name: "blog",
  title: "Blog post",
  type: "document",
  fields: [
    languageField,
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96, isUnique: isUniquePerLanguage },
      description: "Part of the public URL. Changing it breaks existing links.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      description: "One or two sentences. Shown on cards and in search results.",
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "coverImage",
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
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "categories",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })],
    }),
    defineField({
      name: "content",
      type: "blockContent",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "readingMinutes",
      type: "number",
      title: "Reading time (minutes)",
      validation: (rule) => rule.min(1).max(60),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      description:
        "Posts are ordered by this date. A future date still publishes — the site does not filter on it.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", date: "publishedAt", media: "coverImage" },
    prepare: ({ title, date, media }) => ({
      title,
      subtitle: date ? new Date(date as string).toLocaleDateString("en-IN") : "No date",
      media,
    }),
  },
});
