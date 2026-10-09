"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { useToast } from "@/components/ui/Toast";

/**
 * Uploads a profile photograph for the signed-in student.
 *
 * The file is posted to a Route Handler, which validates it and stores it in
 * Cloudinary server-side, rather than going straight to Cloudinary under a
 * signature. A photograph is small, and this is the only upload path where the
 * server sees the bytes and can enforce the 2 MB limit — the checks below are
 * for a quick message, not security.
 *
 * Every outcome is a toast rather than text under the button. The card above
 * redraws itself on success, so a success line would be the second thing
 * saying so; and a rejected file leaves nothing on screen to attach an error
 * to, the input having been cleared.
 */

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function PhotoUploadButton({ hasPhoto }: { hasPhoto: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      showToast("error", "Upload a JPEG, PNG or WebP image.");
      return;
    }

    if (file.size > MAX_BYTES) {
      showToast("error", "Photographs must be under 2 MB.");
      return;
    }

    setBusy(true);

    try {
      const body = new FormData();
      body.append("photo", file);

      const response = await fetch("/dashboard/services/i-card/photo", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;

        showToast("error", payload?.message ?? "That photograph could not be saved.");
        return;
      }

      // The card is a Server Component: refreshing is what re-signs the photo
      // URL and redraws it.
      router.refresh();

      showToast(
        "success",
        hasPhoto ? "Photograph replaced." : "Photograph uploaded.",
      );
    } catch {
      showToast("error", "That photograph could not be saved. Check your connection.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-12 items-center justify-center gap-2 bg-indigo px-5 text-small font-semibold text-white transition-colors hover:bg-indigo-900 disabled:opacity-55 sm:text-body"
      >
        <Camera aria-hidden className="size-4" />
        {busy ? "Uploading…" : hasPhoto ? "Replace photo" : "Upload photo"}
      </button>
    </div>
  );
}
