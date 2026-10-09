"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import Link from "@/i18n/Link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { searchDocs, type SearchDoc } from "@/lib/search";

const SUGGESTIONS = [
  "Prelims",
  "answer writing",
  "optional subject",
  "fees",
  "mentorship",
  "CSAT",
];

export function SearchExperience({
  docs,
  initialQuery = "",
}: {
  docs: SearchDoc[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => searchDocs(query, docs), [query, docs]);
  const hasQuery = query.trim().length > 0;

  return (
    <div>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
        />
        <label htmlFor="site-search" className="sr-only">
          Search vidyantIAS
        </label>
        <Input
          id="site-search"
          type="search"
          value={query}
          placeholder="Search programs, faculty, resources and FAQs"
          onChange={(event) => setQuery(event.target.value)}
          className="h-13 pl-12 text-body"
        />
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              onClick={() => setQuery(suggestion)}
              className="rounded-full border border-line px-3.5 py-1.5 text-small text-ink-secondary transition-colors hover:border-indigo hover:text-indigo"
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="mt-8 text-small text-ink-muted">
        {hasQuery
          ? `${results.length} result${results.length === 1 ? "" : "s"} for “${query.trim()}”`
          : `Search across ${docs.length} pages — programs, faculty, resources and answers.`}
      </p>

      {hasQuery ? (
        results.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {results.map((doc) => (
              <li key={`${doc.type}-${doc.id}`}>
                <Card interactive padding="sm">
                  <Badge tone="neutral">{doc.type}</Badge>
                  <h2 className="mt-3 text-h4 font-semibold">
                    <Link href={doc.href} className="transition-colors hover:text-kesar-600">
                      {doc.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-small text-ink-secondary">{doc.description}</p>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card className="mt-5">
            <h2 className="text-h4 font-semibold">Nothing matched that</h2>
            <p className="mt-3 text-body text-ink-secondary">
              Try a broader word — “Mains”, “test series”, “optional” — or ask the academic
              team directly and we will answer it.
            </p>
          </Card>
        )
      ) : null}
    </div>
  );
}
