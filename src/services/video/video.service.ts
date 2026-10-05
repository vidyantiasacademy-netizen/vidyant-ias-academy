import "server-only";

import { createSign } from "node:crypto";

import { requireAuth } from "@/lib/auth/server";
import { AppError, ERROR_CODES } from "@/lib/errors";

import { activityService } from "../activity/activity.service";
import { courseService } from "../courses/course.service";

/**
 * Video playback.
 *
 * The abstraction exists so that components never see Mux. A player receives a
 * `VideoPlayback` — a playback id and a token — and nothing else; swapping Mux
 * for Cloudflare Stream or Bunny later is a change to this file only.
 *
 * Mux signed playback is the important part: a public playback id can be
 * embedded on any site, which for paid lecture content means the course leaks on
 * day one. Signed playback ids require a JWT per view, minted here after the
 * caller's enrollment is checked, valid for the length of one sitting.
 *
 * Mux setup: create a signing key (Settings → Signing Keys), set the private key
 * (base64 PEM) as `MUX_SIGNING_KEY_PRIVATE` and its id as `MUX_SIGNING_KEY_ID`,
 * and upload assets with `playback_policy: ["signed"]`.
 */

export interface VideoPlayback {
  /** Mux playback id. Meaningless without the token. */
  playbackId: string;
  /** JWT for the `video` audience. Expires. */
  token: string;
  /** Signed thumbnail token, for the poster image. */
  thumbnailToken: string;
  expiresInSeconds: number;
}

const PLAYBACK_TTL_SECONDS = 4 * 60 * 60;

function signingKey() {
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  const privateKeyBase64 = process.env.MUX_SIGNING_KEY_PRIVATE;

  if (!keyId || !privateKeyBase64) {
    throw new AppError(ERROR_CODES.CONFIG_ERROR, {
      message: "Video playback is not available yet.",
      cause: new Error("MUX_SIGNING_KEY_ID / MUX_SIGNING_KEY_PRIVATE are not set"),
    });
  }

  return {
    keyId,
    privateKey: Buffer.from(privateKeyBase64, "base64").toString("utf8"),
  };
}

function base64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Mints an RS256 JWT in Mux's expected shape.
 *
 * Hand-rolled rather than pulled from a JWT library: it is one signature over
 * two base64url segments, and it keeps the dependency count at zero for a
 * feature that is not live yet. If more JWT work appears, replace the body of
 * this function with `jose` — nothing else needs to change.
 */
function signPlaybackToken(
  playbackId: string,
  audience: "v" | "t",
  expiresInSeconds: number,
): string {
  const { keyId, privateKey } = signingKey();

  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT", kid: keyId }));
  const payload = base64Url(
    JSON.stringify({
      sub: playbackId,
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
      kid: keyId,
    }),
  );

  const signature = createSign("RSA-SHA256")
    .update(`${header}.${payload}`)
    .sign(privateKey);

  return `${header}.${payload}.${base64Url(signature)}`;
}

/**
 * Playback credentials for one lesson, for the current caller.
 *
 * `requireLessonAccess` is the gate: it resolves the lesson, checks publication
 * status, free-preview status and the caller's enrollment, and throws otherwise.
 */
export async function getPlayback(lessonId: string): Promise<VideoPlayback> {
  const user = await requireAuth();
  const lesson = await courseService.requireLessonAccess(lessonId);

  if (!lesson.muxAssetId) {
    throw new AppError(ERROR_CODES.NOT_FOUND, {
      message: "This lesson has no video yet.",
    });
  }

  await activityService.record({
    studentUid: user.uid,
    type: "videoStarted",
    lessonId,
    courseId: lesson.courseId,
  });

  return {
    playbackId: lesson.muxAssetId,
    token: signPlaybackToken(lesson.muxAssetId, "v", PLAYBACK_TTL_SECONDS),
    thumbnailToken: signPlaybackToken(lesson.muxAssetId, "t", PLAYBACK_TTL_SECONDS),
    expiresInSeconds: PLAYBACK_TTL_SECONDS,
  };
}

/** Records a completed view. Called by the player at ~95% watched. */
export async function recordCompletion(
  lessonId: string,
  watchedSeconds: number,
): Promise<void> {
  const user = await requireAuth();
  const lesson = await courseService.requireLessonAccess(lessonId);

  await activityService.record({
    studentUid: user.uid,
    type: "videoCompleted",
    lessonId,
    courseId: lesson.courseId,
    durationSeconds: watchedSeconds,
  });
}

export const videoService = { getPlayback, recordCompletion };
