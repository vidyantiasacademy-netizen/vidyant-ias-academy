import {
  documentInternationalization,
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
} from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import { defineConfig, type DocumentActionComponent } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./sanity/schemas";
import {
  SUPPORTED_LANGUAGES,
  TRANSLATED_DOCUMENT_TYPES,
} from "./sanity/schemas/i18n";
import { structure } from "./sanity/structure";

const translatedTypes: readonly string[] = TRANSLATED_DOCUMENT_TYPES;

/**
 * Delete a document together with its translations, and duplicate one with
 * them. Without the first, deleting a translated document fails: its
 * `translation.metadata` still references it. Cast because the plugin types
 * `action` as a plain string, which Sanity's union of action keys rejects.
 */
const translationActions = [
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
] as unknown as DocumentActionComponent[];

/**
 * Sanity Studio, mounted inside this Next.js app at `/studio`.
 *
 * One deploy, one domain, and schemas that live next to the queries that read
 * them. The studio is a client-side app behind Sanity's own login — it is not
 * protected by our Firebase auth, and does not need to be: authorisation is
 * the Sanity project's member list.
 *
 * Config lives at the repo root (not under `src/`) because the Sanity CLI looks
 * for it there — `npx sanity schema extract`, `npx sanity typegen generate` and
 * `npx sanity deploy` all read this file.
 */
export default defineConfig({
  name: "vidyantias",
  title: "vidyantIAS",
  basePath: "/studio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",

  plugins: [
    structureTool({ structure }),
    // Document-level translations: English and Hindi versions of a post are
    // separate documents, linked by a `translation.metadata` document. See
    // `sanity/schemas/i18n.ts` for which types are translated this way.
    documentInternationalization({
      supportedLanguages: SUPPORTED_LANGUAGES,
      schemaTypes: [...TRANSLATED_DOCUMENT_TYPES],
      // Ties existing (pre-localisation) documents to a translation without
      // having to recreate them.
      allowCreateMetaDoc: true,
    }),
    // GROQ playground. Dev only — it would otherwise let any studio member run
    // arbitrary queries against production from the browser.
    ...(process.env.NODE_ENV === "development" ? [visionTool()] : []),
  ],

  schema: {
    types: schemaTypes,
    // A translated type is created from its per-language template ("Blog post
    // (English)", "Blog post (Hindi)") so `language` is always set. The plain
    // template would create a document with no language.
    templates: (prev) => prev.filter((template) => !translatedTypes.includes(template.id)),
  },

  document: {
    actions: (prev, context) =>
      translatedTypes.includes(context.schemaType)
        ? [...prev, ...translationActions]
        : prev,
  },
});
