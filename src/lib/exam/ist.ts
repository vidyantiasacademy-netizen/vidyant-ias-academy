/**
 * Converting between a `datetime-local` input and the ISO strings stored on a
 * paper.
 *
 * Papers are scheduled in Indian Standard Time whatever the author's laptop
 * clock says: a faculty member travelling abroad who types "10:00" means ten in
 * the morning for the students, not for themselves. IST has no daylight saving,
 * so a fixed offset is exact rather than an approximation.
 */

const IST_OFFSET = "+05:30";
const IST_OFFSET_MS = 330 * 60 * 1000;

/** `"2026-10-12T10:00"` (read as IST) → `"2026-10-12T10:00:00+05:30"`. Empty → null. */
export function istInputToIso(value: string): string | null {
  if (!value) return null;
  return `${value.length === 16 ? `${value}:00` : value}${IST_OFFSET}`;
}

/** Any ISO instant → the `YYYY-MM-DDTHH:mm` an IST `datetime-local` input shows. */
export function isoToIstInput(value: string | null): string {
  if (!value) return "";
  return new Date(Date.parse(value) + IST_OFFSET_MS).toISOString().slice(0, 16);
}

/** "12 Oct 2026, 10:00 am IST". */
export function formatIst(value: string | null): string {
  if (!value) return "Not set";

  return `${new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })} IST`;
}
