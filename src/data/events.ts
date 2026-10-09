import type { Event } from "@/types";

/**
 * Orientation, demo and workshop calendar.
 *
 * TODO(institute): add the next orientation with a real date and set
 * `status: "published"`. Until then the site shows a register-interest state
 * rather than an invented date. Template:
 *
 * {
 *   id: "orientation-2026-01",
 *   slug: "free-upsc-orientation-january-2026",
 *   type: "orientation",
 *   title: "Free UPSC Orientation",
 *   description: "...",
 *   date: "2026-01-18",
 *   time: "11:00 am",
 *   durationMinutes: 120,
 *   mode: "In-centre",
 *   location: "vidyantIAS, Pune",
 *   fee: "Free",
 *   seatsNote: "Limited seats — registration required",
 *   status: "published",
 * }
 */
const events: Event[] = [];

const publishedEvents = events.filter((event) => event.status === "published");

export function upcomingEvents(now = new Date()) {
  return publishedEvents
    .filter((event) => new Date(event.date) >= new Date(now.toDateString()))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function nextOrientation(now = new Date()) {
  return upcomingEvents(now).find((event) => event.type === "orientation");
}
