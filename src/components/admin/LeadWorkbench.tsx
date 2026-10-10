"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type SubmitEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import {
  addEnquiryNoteAction,
  assignEnquiryAction,
  claimEnquiryAction,
  setEnquiryFollowUpAction,
  setEnquiryStatusAction,
} from "@/lib/enquiries/actions";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from "@/lib/enquiries/labels";
import { isoToIstInput, istInputToIso } from "@/lib/exam/ist";
import type { EnquiryStatus } from "@/types/db";

/**
 * The counsellor's controls for one lead: move it along the pipeline, book the
 * next call, log what was said, and take or hand over ownership.
 *
 * Each block saves on its own. A counsellor on a call logs the note while the
 * conversation is fresh and sets the follow-up after hanging up; one shared
 * Save would make them redo the first if the second failed.
 */

interface StaffOption {
  uid: string;
  name: string;
}

interface LeadWorkbenchProps {
  enquiryId: string;
  status: EnquiryStatus;
  followUpAt: string | null;
  assignedTo: string | null;
  currentUid: string;
  /** Present for admins only — the people a lead may be handed to. */
  staff: StaffOption[] | null;
}

type Result = { ok: true } | { ok: false; message: string };

export function LeadWorkbench({
  enquiryId,
  status: savedStatus,
  followUpAt,
  assignedTo,
  currentUid,
  staff,
}: LeadWorkbenchProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  const [status, setStatus] = useState<EnquiryStatus>(savedStatus);
  const [statusNote, setStatusNote] = useState("");
  const [followUp, setFollowUp] = useState(isoToIstInput(followUpAt));
  const [note, setNote] = useState("");
  const [owner, setOwner] = useState(assignedTo ?? "");

  function run(task: () => Promise<Result>, success: string, after?: () => void) {
    startTransition(async () => {
      const result = await task();
      if (!result.ok) {
        showToast("error", result.message);
        return;
      }
      after?.();
      showToast("success", success);
      router.refresh();
    });
  }

  function saveStatus(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    run(
      () => setEnquiryStatusAction({ enquiryId, status, note: statusNote }),
      `Marked ${ENQUIRY_STATUS_LABELS[status].toLowerCase()}.`,
      () => setStatusNote(""),
    );
  }

  function saveFollowUp(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    run(
      () => setEnquiryFollowUpAction({ enquiryId, followUpAt: istInputToIso(followUp) }),
      followUp ? "Follow-up booked." : "Follow-up cleared.",
    );
  }

  function saveNote(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    run(() => addEnquiryNoteAction({ enquiryId, note }), "Note added.", () => setNote(""));
  }

  const closed = savedStatus === "enrolled" || savedStatus === "lost";

  return (
    <div className="space-y-5">
      <Card padding="md">
        <form onSubmit={saveStatus} className="space-y-4">
          <h2 className="text-h4 font-bold">Status</h2>
          <Field id="lead-status" label="Pipeline stage" required>
            <Select
              id="lead-status"
              value={status}
              disabled={pending}
              onChange={(event) => setStatus(event.target.value as EnquiryStatus)}
            >
              {ENQUIRY_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {ENQUIRY_STATUS_LABELS[value]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            id="lead-status-note"
            label="Reason"
            hint={status === "lost" ? "Why they chose not to join — fees, timing, another institute." : undefined}
          >
            <Input
              id="lead-status-note"
              value={statusNote}
              maxLength={1000}
              disabled={pending}
              onChange={(event) => setStatusNote(event.target.value)}
            />
          </Field>
          <Button type="submit" size="sm" disabled={pending || status === savedStatus}>
            Update status
          </Button>
        </form>
      </Card>

      <Card padding="md">
        <form onSubmit={saveFollowUp} className="space-y-4">
          <h2 className="text-h4 font-bold">Next follow-up</h2>
          <Field
            id="lead-follow-up"
            label="Call back on (IST)"
            hint={closed ? "This lead is closed — nothing to follow up." : undefined}
          >
            <Input
              id="lead-follow-up"
              type="datetime-local"
              value={followUp}
              disabled={pending || closed}
              onChange={(event) => setFollowUp(event.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={pending || closed || followUp === isoToIstInput(followUpAt)}>
              Save follow-up
            </Button>
            {followUpAt ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setFollowUp("");
                  run(
                    () => setEnquiryFollowUpAction({ enquiryId, followUpAt: null }),
                    "Follow-up cleared.",
                  );
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card padding="md">
        <form onSubmit={saveNote} className="space-y-4">
          <h2 className="text-h4 font-bold">Log a call</h2>
          <Field id="lead-note" label="What was said" required>
            <Textarea
              id="lead-note"
              rows={3}
              value={note}
              maxLength={1000}
              disabled={pending}
              placeholder="Attempt year, optional subject, fee concerns, when they can visit…"
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
          <Button type="submit" size="sm" disabled={pending || note.trim().length === 0}>
            Add note
          </Button>
        </form>
      </Card>

      <Card padding="md" className="space-y-4">
        <h2 className="text-h4 font-bold">Owner</h2>
        {staff ? (
          <>
            <Field id="lead-owner" label="Assigned counsellor">
              <Select
                id="lead-owner"
                value={owner}
                disabled={pending}
                onChange={(event) => setOwner(event.target.value)}
              >
                <option value="">Unassigned</option>
                {staff.map((person) => (
                  <option key={person.uid} value={person.uid}>
                    {person.uid === currentUid ? `${person.name} (you)` : person.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Button
              size="sm"
              disabled={pending || owner === (assignedTo ?? "")}
              onClick={() =>
                run(
                  () => assignEnquiryAction({ enquiryId, counsellorUid: owner || null }),
                  owner ? "Lead assigned." : "Lead unassigned.",
                )
              }
            >
              Save owner
            </Button>
          </>
        ) : assignedTo === currentUid ? (
          <p className="text-body text-ink-secondary">This lead is yours.</p>
        ) : assignedTo ? (
          <p className="text-body text-ink-secondary">
            Another counsellor owns this lead. Ask an admin to reassign it.
          </p>
        ) : (
          <>
            <p className="text-body text-ink-secondary">Nobody owns this lead yet.</p>
            <Button
              size="sm"
              disabled={pending}
              onClick={() => run(() => claimEnquiryAction({ enquiryId }), "This lead is now yours.")}
            >
              Take this lead
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
