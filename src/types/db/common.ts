/**
 * Shared field shapes for every Firestore document.
 *
 * Timestamps are modelled as ISO-8601 strings in the application layer even
 * though Firestore stores `Timestamp` values — the conversion happens once in
 * `lib/firebase/firestore.ts`. That keeps entities serialisable across the
 * Server Component boundary, and keeps a future Postgres/BigQuery export a
 * straight column mapping instead of a vendor type unwrap.
 */

/**
 * ISO-8601 in UTC, e.g. `2026-04-12T06:30:00.000Z`. Written that way so values
 * sort and compare as text; compare them with `lib/utils/instant.ts` anyway,
 * since a value from elsewhere may carry an offset.
 */
export type IsoDateTime = string;

/** `YYYY-MM-DD`. Used where a clock time would be meaningless (exam dates). */
export type IsoDate = string;

/** Firebase Auth UID. The canonical user identifier across the whole system. */
export type Uid = string;

/** Every entity carries these. Written by `auditOnCreate` / `auditOnUpdate`. */
export interface AuditFields {
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  /** Uid of the actor, or `"system"` for Cloud Functions and webhooks. */
  createdBy: Uid | "system";
  updatedBy: Uid | "system";
}

/** An entity as the application sees it: document id plus data plus audit. */
export type Entity<T> = T & { id: string } & AuditFields;

export type PublishStatus = "draft" | "published" | "archived";

/** Cursor pagination. `cursor` is the last document id of the previous page. */
export interface PageRequest {
  limit?: number;
  cursor?: string | null;
}

export interface Page<T> {
  items: T[];
  /** Pass back as `cursor` to fetch the next page. `null` when exhausted. */
  nextCursor: string | null;
}

/** Money is stored in paise to keep arithmetic exact. ₹1,500 → 150000. */
export interface Money {
  amountInPaise: number;
  currency: "INR";
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}
