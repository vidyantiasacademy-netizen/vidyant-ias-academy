import "server-only";

import { requireAuth } from "@/lib/auth/server";
import { COLLECTIONS, docId } from "@/lib/firebase/collections";
import { auditOnCreate, collection } from "@/lib/firebase/firestore";
import type { PushDeviceDoc, PushPlatform } from "@/types/db";

/**
 * Push-notification registrations from the mobile app.
 *
 * Registration only. Delivery — fanning `notificationService.notify` out to
 * these tokens through the Expo push service — is a Cloud Function or a
 * server hook still to be written; see `docs/mobile-api.md`. Until then the
 * in-app notification list is the source of truth and pushes are not sent.
 */

export interface RegisterDeviceInput {
  installationId: string;
  platform: PushPlatform;
  token: string;
  appVersion?: string | null;
}

export async function registerOwn(input: RegisterDeviceInput): Promise<void> {
  const user = await requireAuth();

  const doc: PushDeviceDoc = {
    userUid: user.uid,
    installationId: input.installationId,
    platform: input.platform,
    token: input.token,
    appVersion: input.appVersion ?? null,
    lastSeenAt: new Date().toISOString(),
  };

  await collection(COLLECTIONS.pushDevices)
    .doc(docId.pushDevice(user.uid, input.installationId))
    .set({ ...doc, ...auditOnCreate(user.uid) });
}

/** Called on sign-out, so the next person on the phone does not get these pushes. */
export async function removeOwn(installationId: string): Promise<void> {
  const user = await requireAuth();

  await collection(COLLECTIONS.pushDevices)
    .doc(docId.pushDevice(user.uid, installationId))
    .delete();
}

export const pushDeviceService = { registerOwn, removeOwn };
