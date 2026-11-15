"use client";

import { FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { attachQuestionPaperAction } from "@/lib/answer-writing/staff-actions";
import { MEDIA_PATHS, UPLOAD_LIMITS, uniqueAssetName } from "@/lib/cloudinary/media-paths";
import { uploadFile } from "@/lib/cloudinary/upload";

/**
 * Uploads a Mains paper's question paper — the PDF with the questions and the
 * answer spaces students write in.
 *
 * Straight to Cloudinary under a signature for `tests/{testId}/paper/`, then the
 * paper is pointed at it. A replaced PDF is not deleted: nobody can have opened
 * it (replacing is refused once a student has), but keeping it costs little and
 * means a mistaken replace is recoverable.
 */
export function QuestionPaperUpload({ testId, hasPaper }: { testId: string; hasPaper: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [percent, setPercent] = useState<number | null>(null);

  async function upload(file: File) {
    setPercent(0);

    try {
      const path = await uploadFile(
        MEDIA_PATHS.testQuestionPaper(testId, uniqueAssetName(file.name)),
        file,
        { kind: "document", onProgress: setPercent },
      );

      const result = await attachQuestionPaperAction({ testId, path });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      showToast("success", hasPaper ? "Question paper replaced." : "Question paper uploaded.");
      router.refresh();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "The question paper could not be uploaded.");
    } finally {
      setPercent(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_LIMITS.document.mimeTypes.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <Button
        variant={hasPaper ? "secondary" : "primary"}
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={percent !== null}
      >
        <FileUp aria-hidden className="size-4" />
        {percent !== null ? `Uploading… ${percent}%` : hasPaper ? "Replace PDF" : "Upload question paper (PDF)"}
      </Button>
      <span className="text-small text-ink-secondary">
        PDF, up to {Math.round(UPLOAD_LIMITS.document.maxBytes / (1024 * 1024))} MB.
      </span>
    </div>
  );
}
