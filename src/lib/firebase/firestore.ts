import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type {
  CollectionReference,
  DocumentData,
  DocumentSnapshot,
  Query,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

import { AppError, ERROR_CODES } from "@/lib/errors";
import type { AuditFields, Entity, Page, PageRequest, Uid } from "@/types/db";

import { getAdminDb } from "./admin";
import type { CollectionName } from "./collections";

/**
 * Server-side Firestore helpers shared by every service.
 *
 * Two jobs: convert Firestore `Timestamp`s to ISO strings on the way out (so
 * entities survive the Server → Client Component boundary and map cleanly onto
 * SQL columns later), and stamp audit fields on the way in.
 */

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 25;

export function collection(name: CollectionName): CollectionReference {
  return getAdminDb().collection(name);
}

/**
 * Recursively replaces `Timestamp` with an ISO string. Firestore returns
 * `Timestamp` at any depth, and a nested one (e.g. inside `enquiry.activity[]`)
 * is what breaks serialisation in practice.
 */
function deserialise(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(deserialise);

  if (value && typeof value === "object" && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value as DocumentData).map(([key, nested]) => [
        key,
        deserialise(nested),
      ]),
    );
  }

  return value;
}

/** Snapshot → entity. Returns `null` for a missing document, never throws. */
export function toEntity<T>(
  snapshot: DocumentSnapshot | QueryDocumentSnapshot,
): Entity<T> | null {
  if (!snapshot.exists) return null;

  return {
    ...(deserialise(snapshot.data()) as T),
    id: snapshot.id,
  } as Entity<T>;
}

/** Same, but for a document that must exist. Throws `NOT_FOUND` otherwise. */
export function requireEntity<T>(
  snapshot: DocumentSnapshot,
  what = "record",
): Entity<T> {
  const entity = toEntity<T>(snapshot);

  if (!entity) {
    throw new AppError(ERROR_CODES.NOT_FOUND, {
      cause: new Error(`${what} ${snapshot.ref.path} does not exist`),
    });
  }

  return entity;
}

export function toEntities<T>(
  snapshots: QueryDocumentSnapshot[],
): Entity<T>[] {
  return snapshots
    .map((snapshot) => toEntity<T>(snapshot))
    .filter((entity): entity is Entity<T> => entity !== null);
}

/**
 * Cursor pagination over an already-ordered query.
 *
 * Cursor-based rather than offset-based because Firestore bills `offset` as if
 * it had read every skipped document — page 50 of an admin table would cost
 * 1,250 reads per view.
 */
export async function paginate<T>(
  query: Query,
  { limit = DEFAULT_PAGE_SIZE, cursor }: PageRequest = {},
): Promise<Page<Entity<T>>> {
  const size = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);

  let paged = query.limit(size);

  if (cursor) {
    const anchor = await query.firestore.doc(cursor).get();
    if (anchor.exists) paged = query.startAfter(anchor).limit(size);
  }

  const snapshot = await paged.get();
  const items = toEntities<T>(snapshot.docs);
  const last = snapshot.docs.at(-1);

  return {
    items,
    nextCursor: snapshot.size === size && last ? last.ref.path : null,
  };
}

type Actor = Uid | "system";

/** Audit stamp for a create. `serverTimestamp()` so clocks cannot be faked. */
export function auditOnCreate(actor: Actor) {
  return {
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: actor,
    updatedBy: actor,
  };
}

/** Audit stamp for an update. Never touches `createdAt` / `createdBy`. */
export function auditOnUpdate(actor: Actor) {
  return {
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: actor,
  };
}

/** Narrow a patch to the fields a caller is allowed to change. */
export function pickFields<T extends object, K extends keyof T>(
  input: Partial<T>,
  allowed: readonly K[],
): Pick<Partial<T>, K> {
  const output = {} as Pick<Partial<T>, K>;

  for (const key of allowed) {
    if (input[key] !== undefined) output[key] = input[key];
  }

  return output;
}

export type WriteableFields<T> = Omit<T, keyof AuditFields | "id">;

export { FieldValue, Timestamp };
