"use client";

import {
  ArrowDown,
  ArrowUp,
  Camera,
  ExternalLink,
  FileImage,
  FileText,
  Send,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ChangeEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  addAnswerFileAction,
  removeAnswerFileAction,
  reorderAnswerFilesAction,
  submitAnswerCopyAction,
  withdrawAnswerCopyAction,
} from "@/lib/answer-writing/actions";
import { compressForUpload } from "@/lib/answer-writing/compress-image";
import { MAX_ANSWER_FILES, formatBytes } from "@/lib/answer-writing/policy";
import { MEDIA_PATHS, UPLOAD_LIMITS, uniqueAssetName } from "@/lib/cloudinary/media-paths";
import { assertUploadable, uploadFile } from "@/lib/cloudinary/upload";
import type { AnswerSheetFile } from "@/types/db";

/**
 * The student's answer sheet: add pages, put them in order, submit.
 *
 * Pages go straight from the device to Cloudinary under a per-file signature,
 * then are registered with the server one at a time. One at a time is
 * deliberate: on a phone connection parallel uploads do not finish sooner, and
 * a sequence keeps the pages in the order they were picked and leaves every
 * page that made it in place if the connection drops halfway.
 *
 * Photographs are re-encoded on the device first (`compressForUpload`), which
 * typically turns a 6 MB photo into well under 1 MB without losing legibility.
 */

const ACCEPT = UPLOAD_LIMITS.answerSheet.mimeTypes.join(",");

interface Progress {
  current: number;
  total: number;
  percent: number;
  phase: "preparing" | "uploading";
}

export function AnswerSheetUploader({
  testId,
  studentUid,
  submissionId,
  files: serverFiles,
  canEdit,
  canWithdraw,
}: {
  testId: string;
  studentUid: string;
  submissionId: string;
  files: AnswerSheetFile[];
  canEdit: boolean;
  canWithdraw: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const pickerRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<Progress | null>(null);

  // Local copy for instant feedback, re-synced whenever the server sends a new
  // list (after `router.refresh()`), using React's "adjust state on prop
  // change" pattern rather than an effect.
  const [files, setFiles] = useState(serverFiles);
  const [lastServerFiles, setLastServerFiles] = useState(serverFiles);
  if (serverFiles !== lastServerFiles) {
    setLastServerFiles(serverFiles);
    setFiles(serverFiles);
  }

  const busy = pending || progress !== null;
  const room = MAX_ANSWER_FILES - files.length;

  async function addFiles(chosen: File[]) {
    if (chosen.length === 0) return;

    if (chosen.length > room) {
      showToast(
        "error",
        room > 0
          ? `You can add ${room} more file${room === 1 ? "" : "s"} — a copy holds at most ${MAX_ANSWER_FILES}.`
          : `A copy holds at most ${MAX_ANSWER_FILES} files. Remove some, or combine pages into one PDF.`,
      );
      return;
    }

    let added = 0;

    for (const [index, original] of chosen.entries()) {
      setProgress({ current: index + 1, total: chosen.length, percent: 0, phase: "preparing" });

      try {
        const file = await compressForUpload(original);
        assertUploadable(file, "answerSheet");

        setProgress((current) => current && { ...current, phase: "uploading" });

        const path = await uploadFile(
          MEDIA_PATHS.studentAnswerSheet(studentUid, submissionId, uniqueAssetName(original.name)),
          file,
          {
            kind: "answerSheet",
            onProgress: (percent) => setProgress((current) => current && { ...current, percent }),
          },
        );

        const result = await addAnswerFileAction({
          testId,
          path,
          name: (original.name || `Page ${files.length + index + 1}`).slice(0, 120),
          bytes: file.size,
        });

        if (!result.ok) {
          showToast("error", result.message);
          break;
        }

        setFiles(result.data.files);
        added += 1;
      } catch (error) {
        showToast(
          "error",
          error instanceof Error ? error.message : "That file could not be uploaded. Please try again.",
        );
        break;
      }
    }

    setProgress(null);
    for (const input of [pickerRef.current, cameraRef.current]) if (input) input.value = "";

    if (added > 0) {
      showToast("success", `${added} file${added === 1 ? "" : "s"} added.`);
      router.refresh();
    }
  }

  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= files.length) return;

    const previous = files;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    setFiles(next);

    startTransition(async () => {
      const result = await reorderAnswerFilesAction({ testId, paths: next.map((file) => file.path) });

      if (!result.ok) {
        setFiles(previous);
        showToast("error", result.message);
        return;
      }

      setFiles(result.data.files);
    });
  }

  function remove(file: AnswerSheetFile, position: number) {
    if (!window.confirm(`Remove file ${position} (${file.name}) from your answer sheet?`)) return;

    startTransition(async () => {
      const result = await removeAnswerFileAction({ testId, path: file.path });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      setFiles(result.data.files);
      router.refresh();
    });
  }

  function submit() {
    const noun = `${files.length} file${files.length === 1 ? "" : "s"}`;

    if (
      !window.confirm(
        `Submit ${noun} for evaluation?\n\nYou can withdraw it to make changes until an evaluator starts on it, as long as the deadline has not passed.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await submitAnswerCopyAction({ testId });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      showToast("success", "Submitted for evaluation.");
      router.refresh();
    });
  }

  function withdraw() {
    if (!window.confirm("Withdraw your copy to change it? Remember to submit it again before the deadline.")) {
      return;
    }

    startTransition(async () => {
      const result = await withdrawAnswerCopyAction({ testId });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      showToast("success", "Withdrawn. Your pages are as you left them.");
      router.refresh();
    });
  }

  const onPick = (event: ChangeEvent<HTMLInputElement>) =>
    void addFiles(Array.from(event.target.files ?? []));

  return (
    <div>
      {canEdit ? (
        <div className="border-2 border-dashed border-line-strong bg-white p-5 sm:p-6">
          <input
            ref={pickerRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={onPick}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={onPick}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => pickerRef.current?.click()} disabled={busy || room <= 0}>
              <Upload aria-hidden className="size-4" />
              {files.length > 0 ? "Add more pages" : "Add answer pages"}
            </Button>
            {/* A phone student photographs page by page; one tap straight to the camera. */}
            <Button
              variant="secondary"
              className="sm:hidden"
              onClick={() => cameraRef.current?.click()}
              disabled={busy || room <= 0}
            >
              <Camera aria-hidden className="size-4" />
              Take a photo
            </Button>
          </div>

          <p className="mt-3 text-small text-ink-secondary">
            Photos (JPEG or PNG) or a scanned PDF, up to{" "}
            {Math.round(UPLOAD_LIMITS.answerSheet.maxBytes / (1024 * 1024))} MB each and{" "}
            {MAX_ANSWER_FILES} files in all. Photos are compressed on your device before they upload.
          </p>

          {progress ? (
            <div className="mt-4" role="status" aria-live="polite">
              <p className="text-small font-semibold text-indigo">
                {progress.phase === "preparing" ? "Preparing" : "Uploading"} file {progress.current} of{" "}
                {progress.total}
                {progress.phase === "uploading" ? ` · ${progress.percent}%` : "…"}
              </p>
              <div className="mt-2 h-2 bg-paper" aria-hidden>
                <div
                  className="h-full bg-kesar transition-[width] duration-200"
                  style={{
                    width: `${(((progress.current - 1) + progress.percent / 100) / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {files.length > 0 ? (
        <ol className="mt-5 divide-y divide-line border border-line bg-white" aria-label="Your answer sheet">
          {files.map((file, index) => {
            const position = index + 1;
            const isPdf = file.format === "pdf";

            return (
              <li key={file.path} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                <span className="w-6 shrink-0 text-small font-semibold tabular-nums text-ink-secondary">
                  {position}.
                </span>
                {isPdf ? (
                  <FileText aria-hidden className="size-5 shrink-0 text-indigo" />
                ) : (
                  <FileImage aria-hidden className="size-5 shrink-0 text-indigo" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{file.name}</span>
                  <span className="text-small text-ink-secondary">
                    {file.format.toUpperCase()} · {formatBytes(file.bytes)}
                  </span>
                </span>

                <span className="flex items-center">
                  <a
                    href={`/dashboard/mains/${testId}/file/${position}`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex h-10 items-center gap-1.5 px-3 text-small font-semibold text-indigo hover:bg-paper"
                  >
                    View
                    <ExternalLink aria-hidden className="size-3.5" />
                    <span className="sr-only">file {position}</span>
                  </a>

                  {canEdit ? (
                    <>
                      <IconButton
                        label={`Move file ${position} up`}
                        onClick={() => move(index, -1)}
                        disabled={busy || index === 0}
                      >
                        <ArrowUp aria-hidden className="size-4" />
                      </IconButton>
                      <IconButton
                        label={`Move file ${position} down`}
                        onClick={() => move(index, 1)}
                        disabled={busy || index === files.length - 1}
                      >
                        <ArrowDown aria-hidden className="size-4" />
                      </IconButton>
                      <IconButton
                        label={`Remove file ${position}`}
                        onClick={() => remove(file, position)}
                        disabled={busy}
                        danger
                      >
                        <Trash2 aria-hidden className="size-4" />
                      </IconButton>
                    </>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}

      {canEdit && files.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button size="lg" onClick={submit} disabled={busy}>
            <Send aria-hidden className="size-4" />
            Submit for evaluation
          </Button>
          <p className="max-w-md text-small text-ink-secondary">
            Open each file once to check every page is upright, in order and readable.
          </p>
        </div>
      ) : null}

      {canWithdraw ? (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={withdraw} disabled={busy}>
            <Undo2 aria-hidden className="size-4" />
            Withdraw to make changes
          </Button>
          <p className="max-w-md text-small text-ink-secondary">
            Possible until an evaluator starts on your copy, and only before the deadline.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={
        danger
          ? "flex size-10 items-center justify-center text-ink-secondary hover:bg-paper hover:text-danger disabled:opacity-40"
          : "flex size-10 items-center justify-center text-ink-secondary hover:bg-paper hover:text-indigo disabled:opacity-40"
      }
    >
      {children}
    </button>
  );
}
