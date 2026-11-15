import "server-only";

import { requireAuth, requireRole } from "@/lib/auth/server";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  FieldValue,
  auditOnCreate,
  collection,
  paginate,
  toEntity,
} from "@/lib/firebase/firestore";
import type {
  Notification,
  NotificationDoc,
  NotificationKind,
  Page,
  PageRequest,
} from "@/types/db";

/**
 * In-app notifications.
 *
 * One document per recipient (fan-out on write). The alternative — one document
 * with a recipient array — cannot be queried as "my unread notifications,
 * newest first" without reading every notification in the system.
 *
 * Push delivery (FCM) is a later addition and belongs behind this same service:
 * `notifyMany()` would also enqueue a Cloud Function send, so no caller changes.
 */

export interface NotifyInput {
  userUid: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** In-app path only. An external URL here is a phishing vector. */
  href?: string | null;
}

export async function notify(input: NotifyInput, actorUid = "system"): Promise<void> {
  if (input.href && !input.href.startsWith("/")) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      cause: new Error(`notification href must be in-app: ${input.href}`),
    });
  }

  const doc: NotificationDoc = {
    userUid: input.userUid,
    kind: input.kind,
    title: input.title,
    body: input.body,
    href: input.href ?? null,
    readAt: null,
  };

  await collection(COLLECTIONS.notifications)
    .doc()
    .set({ ...doc, ...auditOnCreate(actorUid) });
}

/** Staff broadcast. Batched in chunks of 500 — Firestore's write-batch limit. */
export async function notifyMany(
  userUids: string[],
  input: Omit<NotifyInput, "userUid">,
): Promise<number> {
  const actor = await requireRole("ADMIN");
  return writeMany(userUids, input, actor.uid);
}

/**
 * The same notice to several users, triggered by the system rather than typed
 * by an admin — e.g. "your evaluated copy is back" when a paper's results are
 * released. No role check, like `notify()`: callers are services that have
 * already authorised the action that caused it.
 */
export async function notifyUsers(
  userUids: string[],
  input: Omit<NotifyInput, "userUid">,
  actorUid = "system",
): Promise<number> {
  if (input.href && !input.href.startsWith("/")) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      cause: new Error(`notification href must be in-app: ${input.href}`),
    });
  }

  return writeMany(userUids, input, actorUid);
}

async function writeMany(
  userUids: string[],
  input: Omit<NotifyInput, "userUid">,
  actorUid: string,
): Promise<number> {
  const db = collection(COLLECTIONS.notifications).firestore;

  for (let index = 0; index < userUids.length; index += 500) {
    const batch = db.batch();

    for (const userUid of userUids.slice(index, index + 500)) {
      const doc: NotificationDoc = {
        userUid,
        kind: input.kind,
        title: input.title,
        body: input.body,
        href: input.href ?? null,
        readAt: null,
      };

      batch.set(collection(COLLECTIONS.notifications).doc(), {
        ...doc,
        ...auditOnCreate(actorUid),
      });
    }

    await batch.commit();
  }

  return userUids.length;
}

/** The caller's notifications, newest first. */
export async function listOwn(page: PageRequest = {}): Promise<Page<Notification>> {
  const user = await requireAuth();

  const query = collection(COLLECTIONS.notifications)
    .where("userUid", "==", user.uid)
    .orderBy("createdAt", "desc");

  return paginate<NotificationDoc>(query, page) as Promise<Page<Notification>>;
}

export async function countUnread(): Promise<number> {
  const user = await requireAuth();

  // `count()` is an aggregation query: billed as one read, not one per document.
  const snapshot = await collection(COLLECTIONS.notifications)
    .where("userUid", "==", user.uid)
    .where("readAt", "==", null)
    .count()
    .get();

  return snapshot.data().count;
}

export async function markRead(notificationId: string): Promise<void> {
  const user = await requireAuth();

  const ref = collection(COLLECTIONS.notifications).doc(notificationId);
  const notification = toEntity<Notification>(await ref.get());

  if (!notification) throw new AppError(ERROR_CODES.NOT_FOUND);
  if (notification.userUid !== user.uid) throw new AppError(ERROR_CODES.FORBIDDEN);

  await ref.update({ readAt: FieldValue.serverTimestamp() });
}

export const notificationService = {
  notify,
  notifyMany,
  notifyUsers,
  listOwn,
  countUnread,
  markRead,
};
