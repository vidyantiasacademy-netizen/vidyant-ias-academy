import { BRAND } from "@/lib/constants/site";
import type { EnquiryStatus } from "@/types/db";

/** Pipeline order — the order the status filter and the status picker show. */
export const ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "counselling-scheduled",
  "enrolled",
  "lost",
] as const satisfies readonly EnquiryStatus[];

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  "counselling-scheduled": "Counselling booked",
  enrolled: "Enrolled",
  lost: "Lost",
};

/** Badge tone per status: open work stands out, closed work recedes. */
export const ENQUIRY_STATUS_TONES = {
  new: "chilli",
  contacted: "kesar",
  "counselling-scheduled": "kesar",
  enrolled: "success",
  lost: "neutral",
} as const satisfies Record<EnquiryStatus, string>;

/** Which public form produced the enquiry, as a counsellor would say it. */
export const ENQUIRY_FORM_LABELS: Record<string, string> = {
  demo: "Free demo",
  counselling: "Counselling",
  enquiry: "General enquiry",
  event: "Event registration",
  resource: "Free resource",
  callback: "Callback request",
  brochure: "Brochure",
  enrolment: "Enrolment",
  "mock-test": "Free mock test",
};

export function formLabel(form: string): string {
  return ENQUIRY_FORM_LABELS[form] ?? form;
}

/**
 * The opening WhatsApp line per form. It names what the person asked for, so
 * the first message reads as a reply to them rather than a broadcast — the
 * difference between a lead answering and a lead blocking the number.
 */
const OPENERS: Record<string, string> = {
  demo: "thank you for booking a free demo class",
  counselling: "thank you for requesting a free counselling session",
  enquiry: "thank you for your enquiry",
  event: "thank you for registering for our event",
  resource: "thank you for downloading our free study material",
  callback: "you asked us to call you back",
  brochure: "here is the brochure you requested",
  enrolment: "thank you for your interest in enrolling",
  "mock-test": "thank you for taking our free UPSC mock test",
};

export function whatsappOpener(name: string, form: string, counsellor?: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? name;
  const opener = OPENERS[form] ?? "thank you for getting in touch";
  const from = counsellor ? `This is ${counsellor} from ${BRAND.name}` : `This is ${BRAND.name}`;

  return `Hi ${firstName}, ${from} — ${opener}. When is a good time for a quick call about your UPSC preparation?`;
}

/** `wa.me` link for a 10-digit Indian mobile number as stored on the enquiry. */
export function whatsappHref(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^(?:91|0)?(?=\d{10}$)/, "");
  return `https://wa.me/91${digits}?text=${encodeURIComponent(message)}`;
}
