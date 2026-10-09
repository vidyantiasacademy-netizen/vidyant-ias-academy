import { defineField, defineType } from "sanity";

import { languageField } from "./i18n";

/**
 * Site-wide banner: admission deadlines, batch starts, result announcements.
 *
 * Windowed by `startsAt` / `endsAt` so the institute can schedule one and let it
 * expire on its own — an announcement someone has to remember to delete stays up
 * for months.
 */
export const announcement = defineType({
  name: "announcement",
  title: "Announcement",
  type: "document",
  fields: [
    languageField,
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "body",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "tone",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Info", value: "info" },
          { title: "Good news", value: "success" },
          { title: "Deadline", value: "warning" },
        ],
      },
      initialValue: "info",
    }),
    defineField({
      name: "href",
      type: "string",
      title: "Link",
      description:
        'An in-app path such as "/enrol". Full URLs are allowed only for the institute\'s own domains.',
    }),
    defineField({
      name: "startsAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endsAt",
      type: "datetime",
      description: "Leave empty to show it until it is unpublished.",
      validation: (rule) =>
        rule.min(rule.valueOfField("startsAt")).warning("Should be after the start."),
    }),
  ],
  preview: { select: { title: "title", subtitle: "body" } },
});
