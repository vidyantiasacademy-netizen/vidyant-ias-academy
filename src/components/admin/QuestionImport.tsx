"use client";

import { Download, FileUp, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition, type ChangeEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { importQuestionsAction } from "@/lib/exam/authoring-actions";
import {
  MAX_IMPORT_BYTES,
  MAX_IMPORT_ROWS,
  decodeCsvFile,
  parseQuestionCsv,
  questionCsvSample,
  questionCsvTemplate,
  type ImportParseResult,
} from "@/lib/exam/question-csv";
import { cn } from "@/lib/utils/cn";

/**
 * Upload, preview, import.
 *
 * Nothing is written until the faculty member has seen every row and pressed
 * Import, and a file with a single bad row cannot be imported at all — fix it
 * in the spreadsheet and choose the file again. That is slower than skipping
 * bad rows, and deliberately so: a paper silently missing question 37 is the
 * kind of error nobody finds until a student does.
 */

function normaliseStatement(statement: string): string {
  return statement.replace(/\s+/g, " ").trim().toLowerCase();
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function QuestionImport({
  testId,
  defaults,
  paper,
  existingStatements,
}: {
  testId: string;
  defaults: { subject: string; marks: number };
  /** The paper's targets, and what its published questions already add up to. */
  paper: { questionCount: number; totalMarks: number; liveCount: number; liveMarks: number };
  /** Statements already on the paper, so a re-uploaded file is caught before it doubles up. */
  existingStatements: string[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ImportParseResult | null>(null);
  const [publish, setPublish] = useState(false);

  const rows = useMemo(() => result?.rows ?? [], [result]);
  const bad = rows.filter((row) => row.errors.length > 0);
  const good = rows.filter((row) => row.question);
  const ready = result !== null && result.fileErrors.length === 0 && bad.length === 0 && good.length > 0;

  const fileMarks = round(good.reduce((sum, row) => sum + (row.question?.marks ?? 0), 0));

  // Warnings, not errors: the same statement can legitimately appear twice
  // (a PYQ reused with different options), but far more often it is the same
  // file chosen twice.
  const duplicates = useMemo(() => {
    const onPaper = new Set(existingStatements.map(normaliseStatement));
    const seen = new Map<string, number>();
    const found: { row: number; reason: string }[] = [];

    for (const { row, question } of rows) {
      if (!question) continue;
      const key = normaliseStatement(question.statement);

      if (onPaper.has(key)) {
        found.push({ row, reason: "is already on this paper" });
      } else if (seen.has(key)) {
        found.push({ row, reason: `repeats row ${seen.get(key)}` });
      } else {
        seen.set(key, row);
      }
    }

    return found;
  }, [rows, existingStatements]);

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.size > MAX_IMPORT_BYTES) {
      setResult({ fileErrors: ["The file is larger than 2 MB. Split it into smaller files."], rows: [] });
      return;
    }

    const decoded = decodeCsvFile(await file.arrayBuffer());
    if ("error" in decoded) {
      setResult({ fileErrors: [decoded.error], rows: [] });
      return;
    }

    setResult(parseQuestionCsv(decoded.text, defaults));
  }

  function reset() {
    setFileName(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function download(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function runImport() {
    if (!ready) return;

    startTransition(async () => {
      const response = await importQuestionsAction({
        testId,
        publish,
        rows: good.map((row) => ({ row: row.row, question: row.question! })),
      });

      if (!response.ok) {
        showToast("error", response.message);
        return;
      }

      const { count } = response.data;
      showToast("success", `${count} question${count === 1 ? "" : "s"} imported${publish ? "" : " as drafts"}.`);
      router.push(`/admin/tests/${testId}`);
      router.refresh();
    });
  }

  const afterCount = paper.liveCount + (publish ? good.length : 0);
  const afterMarks = round(paper.liveMarks + (publish ? fileMarks : 0));

  return (
    <div className="space-y-6">
      <Card padding="md" className="space-y-4">
        <ol className="list-decimal space-y-2 pl-5 text-body text-ink-secondary">
          <li>
            Download the blank template, or the sample to see a filled-in example of every kind
            of row. Fill in one question per row in Excel or Google Sheets. For
            statement-style questions, put each statement on its own line inside the cell
            (Alt+Enter in Excel).
          </li>
          <li>
            In <code>correct</code>, give the answer letter (<code>B</code>), or letters for more
            than one (<code>A,C</code>). Blank <code>marks</code> and <code>subject</code> take the
            paper&apos;s defaults ({defaults.marks} marks{defaults.subject ? `, ${defaults.subject}` : ""}). For a
            previous-year question, fill both <code>pyq_exam</code> (e.g. UPSC CSE Prelims) and{" "}
            <code>pyq_year</code>.
          </li>
          <li>
            Save as <strong>CSV UTF-8</strong> and choose the file below. Up to {MAX_IMPORT_ROWS}{" "}
            questions per file. Images are added afterwards, from each question&apos;s edit page.
          </li>
        </ol>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => download(questionCsvTemplate(), "questions-template.csv")}
          >
            <Download aria-hidden className="size-4" />
            Blank template
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => download(questionCsvSample(), "questions-sample.csv")}
          >
            <Download aria-hidden className="size-4" />
            Sample CSV
          </Button>

          <label
            className={cn(
              "inline-flex h-10 cursor-pointer items-center gap-2 bg-indigo px-4 text-small font-semibold text-white transition-colors hover:bg-indigo-900",
              "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo",
            )}
          >
            <FileUp aria-hidden className="size-4" />
            {fileName ? "Choose another file" : "Choose CSV file"}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={choose}
            />
          </label>

          {fileName ? <span className="self-center text-small text-ink-secondary">{fileName}</span> : null}
        </div>
      </Card>

      {result && result.fileErrors.length > 0 ? (
        <Card padding="md" role="alert" className="border-danger bg-danger-50">
          <p className="font-semibold text-danger">This file cannot be imported</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-small text-danger">
            {result.fileErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {rows.length > 0 ? (
        <>
          <Card padding="md" className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-small text-ink-secondary">In this file</p>
              <p className="text-h3 font-bold">
                {good.length} <span className="text-body font-normal">ready</span>
                {bad.length > 0 ? (
                  <span className="text-body font-normal text-danger"> · {bad.length} with problems</span>
                ) : null}
              </p>
              <p className="text-small text-ink-secondary">{fileMarks} marks</p>
            </div>
            <div>
              <p className="text-small text-ink-secondary">Paper target</p>
              <p className="text-h3 font-bold">{paper.questionCount} questions</p>
              <p className="text-small text-ink-secondary">{paper.totalMarks} marks</p>
            </div>
            <div>
              <p className="text-small text-ink-secondary">Published after import</p>
              <p
                className={cn(
                  "text-h3 font-bold",
                  afterCount > paper.questionCount && "text-danger",
                )}
              >
                {afterCount} questions
              </p>
              <p
                className={cn(
                  "text-small text-ink-secondary",
                  afterCount === paper.questionCount &&
                    Math.abs(afterMarks - paper.totalMarks) > 0.001 &&
                    "font-medium text-danger",
                )}
              >
                {afterMarks} marks
              </p>
            </div>
          </Card>

          {bad.length > 0 ? (
            <Card padding="md" role="alert" className="border-danger">
              <p className="font-semibold text-danger">
                Fix {bad.length === 1 ? "this row" : `these ${bad.length} rows`} in the spreadsheet,
                then choose the file again
              </p>
              <ul className="mt-3 space-y-2 text-small">
                {bad.map((row) => (
                  <li key={row.row} className="flex gap-3">
                    <span className="w-16 shrink-0 font-semibold">Row {row.row}</span>
                    <span className="text-danger">{row.errors.join(" ")}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {duplicates.length > 0 ? (
            <Card padding="md" className="border-kesar bg-kesar-100">
              <p className="flex items-center gap-2 font-semibold text-kesar-700">
                <TriangleAlert aria-hidden className="size-4" />
                Possible duplicates
              </p>
              <ul className="mt-2 space-y-1 text-small text-kesar-700">
                {duplicates.map(({ row, reason }) => (
                  <li key={row}>
                    Row {row} {reason}.
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {good.length > 0 ? (
            <section aria-labelledby="preview-heading">
              <h2 id="preview-heading" className="text-h3 font-bold">
                Preview
              </h2>
              <ol className="mt-4 space-y-3">
                {good.map(({ row, question }) => (
                  <li key={row}>
                    <Card padding="sm">
                      <p className="text-small font-semibold text-ink-secondary">Row {row}</p>
                      <p className="mt-1 whitespace-pre-line text-body">{question!.statement}</p>
                      <ul className="mt-2 space-y-1 text-small">
                        {question!.options.map((option) => {
                          const correct = question!.correctOptionIds.includes(option.id);
                          return (
                            <li
                              key={option.id}
                              className={correct ? "font-medium text-success" : "text-ink-secondary"}
                            >
                              <span className="uppercase">({option.id})</span> {option.text}
                              {correct ? <span className="sr-only"> — correct</span> : null}
                            </li>
                          );
                        })}
                      </ul>
                      <p className="mt-2 text-small text-ink-secondary">
                        {question!.marks} marks · {question!.subject}
                        {question!.topic ? ` · ${question!.topic}` : ""} · {question!.difficulty}
                        {question!.pyq ? ` · ${question!.pyq.exam} ${question!.pyq.year}` : ""}
                        {question!.kind === "mcq-multiple" ? " · more than one correct" : ""}
                      </p>
                    </Card>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </>
      ) : null}

      <Card padding="md" className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-start gap-3 text-body">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-indigo"
            checked={publish}
            onChange={(event) => setPublish(event.target.checked)}
          />
          <span>
            Publish the questions straight away
            <span className="block text-small text-ink-secondary">
              Left unticked, they are imported as drafts to check one by one. Drafts do not count
              towards the paper&apos;s total.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap gap-3">
          {result ? (
            <Button variant="ghost" onClick={reset} disabled={pending}>
              Clear
            </Button>
          ) : (
            <ButtonLink href={`/admin/tests/${testId}`} variant="ghost">
              Cancel
            </ButtonLink>
          )}
          <Button onClick={runImport} disabled={!ready || pending}>
            {pending
              ? "Importing…"
              : ready
                ? `Import ${good.length} question${good.length === 1 ? "" : "s"}`
                : "Import"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
