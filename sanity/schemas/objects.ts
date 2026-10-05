import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Reusable object types.
 *
 * `blockContent` is defined once and shared: every editorial field in the studio
 * should offer the same formatting options, otherwise a blog post and a current
 * affairs article render differently for no reason the editor can see.
 */

export const blockContent = defineType({
  name: "blockContent",
  title: "Content",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Subheading", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({
                name: "href",
                type: "url",
                title: "URL",
                validation: (rule) => rule.required(),
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt text",
          description: "Describe the image for screen readers. Required.",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "caption", type: "string", title: "Caption" }),
      ],
    }),
  ],
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Meta title",
      description: "Defaults to the document title. Keep under 60 characters.",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      title: "Meta description",
      description: "150–160 characters reads best in search results.",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Social share image",
      description: "1200 × 630. Falls back to the site default.",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", title: "Alt text" })],
    }),
    defineField({
      name: "noIndex",
      type: "boolean",
      title: "Hide from search engines",
      initialValue: false,
    }),
  ],
});

export const source = defineType({
  name: "source",
  title: "Source",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      title: "Publication",
      description: 'e.g. "The Hindu", "PIB", "Economic Survey 2025-26"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      type: "url",
      title: "Link",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "url" } },
});

export const curriculumModule = defineType({
  name: "curriculumModule",
  title: "Module",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "topics",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: { title: "title", topics: "topics" },
    prepare: ({ title, topics }) => ({
      title,
      subtitle: `${(topics as string[] | undefined)?.length ?? 0} topics`,
    }),
  },
});
