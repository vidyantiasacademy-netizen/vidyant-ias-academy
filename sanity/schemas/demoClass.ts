import { defineField, defineType } from "sanity";

/**
 * Free demo and orientation classes.
 *
 * `muxPlaybackId` here is a *public* playback id, for a recording the institute
 * is happy to give away. Paid lecture videos are never referenced from Sanity:
 * they live on `lessons/{lessonId}.muxAssetId` in Firestore behind a signed
 * playback token, because anything in this dataset is world-readable.
 */
export const demoClass = defineType({
  name: "demoClass",
  title: "Demo class",
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
    defineField({ name: "subject", type: "reference", to: [{ type: "subject" }] }),
    defineField({ name: "faculty", type: "reference", to: [{ type: "faculty" }] }),
    defineField({
      name: "scheduledFor",
      type: "datetime",
      description: "Leave empty for an on-demand recording.",
    }),
    defineField({
      name: "durationMinutes",
      type: "number",
      validation: (rule) => rule.min(5).max(300),
    }),
    defineField({
      name: "muxPlaybackId",
      type: "string",
      title: "Mux playback ID (public)",
      description:
        "Only for recordings with a public playback policy. Never paste a paid lecture's id here.",
    }),
    defineField({ name: "description", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "title", subtitle: "scheduledFor" } },
});
