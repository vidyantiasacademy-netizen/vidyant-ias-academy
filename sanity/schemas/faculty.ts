import { defineArrayMember, defineField, defineType } from "sanity";

import { isUniquePerLanguage, languageField } from "./i18n";

/**
 * Public faculty profiles.
 *
 * The teaching record a visitor sees. The *operational* faculty record — which
 * courses they may edit, which tests they evaluate — is `faculty/{uid}` in
 * Firestore, joined to this document by slug. Keep credentials and contracts out
 * of here: this dataset is world-readable.
 */
export const faculty = defineType({
  name: "faculty",
  title: "Faculty",
  type: "document",
  fields: [
    languageField,
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 96, isUnique: isUniquePerLanguage },
      description:
        "Must match `faculty/{uid}.sanitySlug` in Firestore for the profiles to link.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "designation",
      type: "string",
      description: 'e.g. "Faculty — Polity & Governance"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photo",
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
      name: "subjects",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "subject" }] })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "experience",
      type: "string",
      description: 'Free text, e.g. "12+ years teaching UPSC aspirants". Only real figures.',
    }),
    defineField({
      name: "bio",
      type: "blockContent",
    }),
    defineField({
      name: "teachingPhilosophy",
      type: "text",
      title: "Teaching philosophy",
      rows: 3,
      description: "One or two sentences, shown as a quote on the profile page.",
    }),
    defineField({
      name: "profilePending",
      type: "boolean",
      title: "Profile pending verification",
      description:
        "On while this profile describes a teaching role rather than a verified person. " +
        'Shows a "Profile pending" label and keeps the page out of search engines.',
      initialValue: false,
    }),
    defineField({
      name: "achievements",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "One line each. Nothing that cannot be substantiated.",
    }),
    defineField({
      name: "order",
      type: "number",
      title: "Sort order",
      description: "Lower numbers appear first on the faculty page.",
    }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "name", subtitle: "designation", media: "photo" } },
});
