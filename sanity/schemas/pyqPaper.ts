import { defineField, defineType } from "sanity";

/**
 * A UPSC previous-year question paper, as a scanned PDF.
 *
 * Read directly by the student app through the Sanity CDN — there is no
 * endpoint in `/api/mobile/v1` for it, and none is needed: these are public
 * UPSC papers, and publishing a document is all it takes for a new paper to
 * show up. (Anything that should be a paid perk does not belong here: this
 * dataset is world-readable. It would go in Firebase Storage behind a signed
 * URL, the way lesson notes do — see `getDocumentLink`.)
 *
 * Not translated: a paper is the same file in every language, and the app
 * labels stage and paper itself.
 *
 * The app's query:
 *   *[_type == "pyqPaper"] | order(year desc, stage asc, paper asc) {
 *     _id, year, stage, paper, pageCount, publishedAt,
 *     "url": file.asset->url, "size": file.asset->size,
 *     "answerKeyUrl": answerKey.asset->url, "answerKeySize": answerKey.asset->size
 *   }
 * File sizes come from the asset itself (`asset->size`, in bytes), so nobody
 * has to type them in.
 */
const PDF_ADVICE =
  "PDF only. Optimise scans first — `ocrmypdf --optimize 3 in.pdf out.pdf` usually takes a 10–30 MB scan down to 1–3 MB and adds a searchable, screen-reader-friendly text layer.";

export const pyqPaper = defineType({
  name: "pyqPaper",
  title: "PYQ paper",
  type: "document",
  fields: [
    defineField({
      name: "year",
      type: "number",
      description: "The year the paper was set, e.g. 2024.",
      validation: (rule) => rule.required().integer().min(1979).max(2100),
    }),
    defineField({
      name: "stage",
      type: "string",
      options: {
        list: [
          { title: "Prelims", value: "prelims" },
          { title: "Mains", value: "mains" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "paper",
      type: "string",
      description: "As students say it: “GS Paper I”, “CSAT”, “Essay”, “GS III”, “Optional – Sociology I”.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "file",
      type: "file",
      title: "Question paper (PDF)",
      description: PDF_ADVICE,
      options: { accept: "application/pdf" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answerKey",
      type: "file",
      title: "Answer key (PDF)",
      description: "UPSC's official key. Prelims only.",
      options: { accept: "application/pdf" },
      hidden: ({ document }) => document?.stage !== "prelims",
    }),
    defineField({
      name: "pageCount",
      type: "number",
      title: "Pages",
      description: "Optional. Shown in the app before download.",
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Year, newest first",
      name: "yearDesc",
      by: [
        { field: "year", direction: "desc" },
        { field: "stage", direction: "desc" },
        { field: "paper", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { year: "year", stage: "stage", paper: "paper", hasKey: "answerKey.asset" },
    prepare: ({ year, stage, paper, hasKey }) => ({
      title: [year, paper].filter(Boolean).join(" · ") || "New paper",
      subtitle: [stage === "prelims" ? "Prelims" : stage === "mains" ? "Mains" : null, hasKey ? "with answer key" : null]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
