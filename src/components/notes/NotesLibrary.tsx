"use client";

import { Search, X } from "lucide-react";
import { useDeferredValue, useId, useState } from "react";

import { NoteCard } from "@/components/notes/NoteCard";
import { cn } from "@/lib/utils/cn";
import type { StudyNoteListItem } from "@/lib/sanity/types";

const ALL = "all";

/** Lowercased, accent-free text to match a query against. */
const normalise = (value: string) =>
  value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

/**
 * The /notes library: search plus a subject filter over every note.
 * With no filter the notes are grouped under subject headings, the way a
 * student thinks about the syllabus; a search or a subject flattens them into
 * one grid of matches.
 */
export function NotesLibrary({ notes }: { notes: StudyNoteListItem[] }) {
  const [subject, setSubject] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const searchId = useId();

  // Subjects in the order the notes arrive (alphabetical from the query).
  const subjects = [...new Set(notes.map((note) => note.subject).filter((s): s is string => Boolean(s)))];

  const terms = normalise(deferredQuery.trim()).split(/\s+/).filter(Boolean);
  const visible = notes.filter((note) => {
    if (subject !== ALL && note.subject !== subject) return false;
    if (terms.length === 0) return true;
    const haystack = normalise([note.title, note.summary, note.subject ?? "", ...note.stages].join(" "));
    return terms.every((term) => haystack.includes(term));
  });

  const grouped = subject === ALL && terms.length === 0;
  const groups = grouped
    ? subjects
        .map((name) => ({ name, notes: visible.filter((note) => note.subject === name) }))
        .concat([{ name: "Other", notes: visible.filter((note) => !note.subject) }])
        .filter((group) => group.notes.length > 0)
    : [];

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <label htmlFor={searchId} className="text-small font-bold text-indigo">
            Search notes
          </label>
          <div className="relative mt-1.5">
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-muted" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. fundamental rights"
              className="h-12 w-full border border-line-strong bg-white pl-10 pr-10 text-body text-ink placeholder:text-ink-muted focus:border-indigo focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo/30 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-indigo"
              >
                <X aria-hidden className="size-4.5" />
              </button>
            ) : null}
          </div>
        </div>

        {subjects.length > 1 ? (
          <div role="group" aria-label="Filter by subject" className="flex flex-wrap gap-2">
            {[ALL, ...subjects].map((name) => {
              const selected = name === subject;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSubject(name)}
                  className={cn(
                    "inline-flex h-10 items-center border-2 px-3.5 text-small font-bold transition-colors",
                    selected
                      ? "border-indigo bg-indigo text-white"
                      : "border-line-strong bg-white text-indigo hover:border-indigo",
                  )}
                >
                  {name === ALL ? "All subjects" : name}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <p aria-live="polite" className="mt-5 text-small text-ink-muted">
        {visible.length === notes.length
          ? `${notes.length} ${notes.length === 1 ? "note" : "notes"}`
          : `Showing ${visible.length} of ${notes.length} notes`}
      </p>

      {visible.length === 0 ? (
        <div className="mt-6 border border-dashed border-line-strong p-8 text-center">
          <p className="text-body font-bold text-indigo">No notes match that yet.</p>
          <p className="mt-1 text-small text-ink-secondary">
            Try a broader word, or{" "}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubject(ALL);
              }}
              className="font-bold text-indigo underline decoration-2 underline-offset-4"
            >
              see all notes
            </button>
            .
          </p>
        </div>
      ) : grouped ? (
        <div className="mt-6 space-y-12">
          {groups.map((group, index) => (
            <section key={group.name} aria-labelledby={`${searchId}-group-${index}`}>
              <h2
                id={`${searchId}-group-${index}`}
                className="flex items-baseline gap-3 border-t-2 border-indigo pt-3 text-h3 font-bold text-indigo"
              >
                {group.name}
                <span className="text-small font-semibold text-ink-muted">{group.notes.length}</span>
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {group.notes.map((note) => (
                  <li key={note._id}>
                    <NoteCard note={note} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {visible.map((note) => (
            <li key={note._id}>
              <NoteCard note={note} headingLevel="h2" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
