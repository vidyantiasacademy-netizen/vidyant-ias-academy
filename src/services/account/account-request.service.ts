import "server-only";

import { getCurrentStudent, requireAuth } from "@/lib/auth/server";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { auditOnCreate, collection } from "@/lib/firebase/firestore";
import type { EnquiryDoc } from "@/types/db";

/**
 * Requests a signed-in student raises from the app: a support ticket, or the
 * deletion of their account.
 *
 * Both land in `enquiries`, the inbox counsellors already work from
 * (`/admin/leads`), rather than in a new queue nobody watches. The student's
 * uid rides along in `convertedStudentUid`, so staff act on the right account
 * without trusting a name or number typed into the form.
 *
 * Deletion is a request, not an immediate delete, on purpose: payments and
 * evaluated answer sheets carry retention obligations, and an active
 * enrollment may need a refund conversation first. The app tells the student
 * so, and how long it takes (see `ACCOUNT_DELETION_SLA_DAYS`).
 */

export const ACCOUNT_DELETION_SLA_DAYS = 30;

type RequestForm = "app-support" | "account-deletion";

async function fileRequest(
  form: RequestForm,
  answers: Record<string, string | null>,
): Promise<{ id: string }> {
  const user = await requireAuth();
  const student = await getCurrentStudent();

  const doc: EnquiryDoc = {
    form,
    name: student?.fullName ?? user.email ?? "Student",
    phone: student?.phone ?? "",
    email: student?.email ?? user.email,
    source: "mobile-app",
    campaign: null,
    courseId: null,
    page: null,
    status: "new",
    assignedTo: null,
    followUpAt: null,
    answers,
    activity: [],
    convertedStudentUid: user.uid,
  };

  const ref = collection(COLLECTIONS.enquiries).doc();
  await ref.set({ ...doc, ...auditOnCreate(user.uid) });

  return { id: ref.id };
}

export async function requestSupport(input: {
  topic: string;
  message: string;
}): Promise<{ id: string }> {
  return fileRequest("app-support", { topic: input.topic, message: input.message });
}

export async function requestAccountDeletion(input: {
  reason: string | null;
}): Promise<{ id: string; slaDays: number }> {
  const filed = await fileRequest("account-deletion", { reason: input.reason });
  return { ...filed, slaDays: ACCOUNT_DELETION_SLA_DAYS };
}

export const accountRequestService = { requestSupport, requestAccountDeletion };
