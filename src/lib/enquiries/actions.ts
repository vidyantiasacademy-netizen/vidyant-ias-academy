"use server";

import { z } from "zod";

import { revalidateLocalizedPath } from "@/i18n/revalidate";
import { action, roleGuard } from "@/lib/auth/guards";
import { enquiryService } from "@/services/enquiries/enquiry.service";

import { ENQUIRY_STATUSES } from "./labels";

/**
 * The leads CRM's server surface. Every action re-checks the role inside
 * `enquiryService` as well — the guard here is what stops an unauthenticated
 * POST from reaching the service at all.
 */

const enquiryId = z.string().trim().min(1).max(128);
const note = z.string().trim().max(1000);

function refresh(id: string) {
  revalidateLocalizedPath("/admin/leads");
  revalidateLocalizedPath(`/admin/leads/${id}`);
  revalidateLocalizedPath("/admin");
}

export const setEnquiryStatusAction = action(
  roleGuard("COUNSELLOR"),
  z.object({
    enquiryId,
    status: z.enum(ENQUIRY_STATUSES),
    note: note.optional(),
  }),
  async (input) => {
    await enquiryService.setStatus(input.enquiryId, input.status, input.note || undefined);
    refresh(input.enquiryId);
    return null;
  },
);

export const addEnquiryNoteAction = action(
  roleGuard("COUNSELLOR"),
  z.object({ enquiryId, note: note.min(1, "Write what happened on the call.") }),
  async (input) => {
    await enquiryService.addNote(input.enquiryId, input.note);
    refresh(input.enquiryId);
    return null;
  },
);

export const setEnquiryFollowUpAction = action(
  roleGuard("COUNSELLOR"),
  z.object({
    enquiryId,
    // A full ISO instant from the browser, which knows the counsellor's zone.
    followUpAt: z.iso.datetime({ offset: true }).nullable(),
  }),
  async (input) => {
    await enquiryService.setFollowUp(input.enquiryId, input.followUpAt);
    refresh(input.enquiryId);
    return null;
  },
);

export const claimEnquiryAction = action(
  roleGuard("COUNSELLOR"),
  z.object({ enquiryId }),
  async (input) => {
    await enquiryService.claim(input.enquiryId);
    refresh(input.enquiryId);
    return null;
  },
);

export const assignEnquiryAction = action(
  roleGuard("ADMIN"),
  z.object({ enquiryId, counsellorUid: z.string().trim().min(1).max(128).nullable() }),
  async (input) => {
    await enquiryService.assign(input.enquiryId, input.counsellorUid);
    refresh(input.enquiryId);
    return null;
  },
);
