import { PortableText, type PortableTextComponents } from "next-sanity";

import type { PortableTextBlocks } from "@/lib/sanity/types";
import { cn } from "@/lib/utils/cn";

/**
 * Renders a Sanity `blockContent` field — blog posts and current-affairs
 * analyses.
 *
 * Styled element by element rather than with a prose plugin, so the article
 * body uses the same type scale and ink colours as the rest of the site. Covers
 * exactly what `sanity/schemas/objects.ts` lets an editor create: h2, h3,
 * quote, bullet and numbered lists, bold, italic and links.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-5 text-body text-ink-secondary first:mt-0 sm:text-body-lg">{children}</p>
    ),
    h2: ({ children }) => <h2 className="mt-12 text-h3 font-semibold text-ink first:mt-0">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 text-h4 font-semibold text-ink first:mt-0">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-kesar-600 pl-5 text-body italic text-ink">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-5 list-disc space-y-2 pl-6 text-body text-ink-secondary sm:text-body-lg">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-5 list-decimal space-y-2 pl-6 text-body text-ink-secondary sm:text-body-lg">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "";
      const external = /^https?:\/\//.test(href);

      return (
        <a
          href={href}
          className="font-medium text-indigo underline underline-offset-2 hover:text-kesar-600"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export function RichText({ value, className }: { value: PortableTextBlocks; className?: string }) {
  if (!value || value.length === 0) return null;

  return (
    <div className={cn(className)}>
      <PortableText value={value as Parameters<typeof PortableText>[0]["value"]} components={components} />
    </div>
  );
}
