"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type SubmitEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  enrolStudentAction,
  findStudentAction,
  setEnrollmentStatusAction,
  type StudentMatch,
} from "@/lib/courses/actions";

/**
 * The enrolment desk on a course page: find a student, then enrol them.
 *
 * Search, not a dropdown of every student — the desk has a phone number or an
 * email in hand, and a list of thousands of names is how the wrong Priya gets
 * enrolled.
 */

/** Today in IST, as `YYYY-MM-DD`. */
function todayIst(): string {
  return new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);
}

export function EnrolStudentPanel({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [searching, startSearch] = useTransition();
  const [enrolling, startEnrol] = useTransition();

  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<StudentMatch[] | null>(null);
  const [selected, setSelected] = useState<StudentMatch | null>(null);
  const [startsAt, setStartsAt] = useState(todayIst);
  const [endsAt, setEndsAt] = useState("");

  function search(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelected(null);

    startSearch(async () => {
      const result = await findStudentAction({ courseId, query });

      if (!result.ok) {
        showToast("error", result.fieldErrors?.query ? "Type at least 3 characters." : result.message);
        return;
      }

      setMatches(result.data);
      if (result.data.length === 1) setSelected(result.data[0]);
    });
  }

  function enrol() {
    if (!selected) return;

    startEnrol(async () => {
      const result = await enrolStudentAction({
        courseId,
        studentUid: selected.uid,
        startsAt,
        endsAt: endsAt || null,
      });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      showToast("success", `${selected.fullName} is enrolled.`);
      setQuery("");
      setMatches(null);
      setSelected(null);
      setEndsAt("");
      router.refresh();
    });
  }

  return (
    <Card padding="md">
      <h2 className="text-h4 font-semibold">Enrol a student</h2>
      <p className="mt-1 text-small text-ink-secondary">
        The student must have signed in to the website once, so their account exists. Search by
        email, mobile number or roll number.
      </p>

      <form onSubmit={search} className="mt-5 flex flex-wrap items-end gap-3" role="search">
        <Field id="student-query" label="Email, mobile or roll number" required className="min-w-0 flex-1">
          <Input
            id="student-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="9876543210 or name@gmail.com"
            autoComplete="off"
          />
        </Field>
        <Button type="submit" variant="secondary" disabled={searching}>
          <Search aria-hidden className="size-4" />
          {searching ? "Searching…" : "Find"}
        </Button>
      </form>

      {matches !== null ? (
        <div className="mt-5" aria-live="polite">
          {matches.length === 0 ? (
            <p className="text-small text-ink-secondary">
              No signed-in student matches that. Ask them to sign in on the website with this
              email or number first, then search again.
            </p>
          ) : (
            <fieldset>
              <legend className="sr-only">Matching students</legend>
              <ul className="space-y-2">
                {matches.map((match) => (
                  <li key={match.uid}>
                    <label className="flex cursor-pointer items-start gap-3 border border-line px-4 py-3 has-checked:border-indigo">
                      <input
                        type="radio"
                        name="student"
                        className="mt-1 size-4 accent-indigo"
                        checked={selected?.uid === match.uid}
                        onChange={() => setSelected(match)}
                      />
                      <span className="min-w-0">
                        <span className="block font-medium">{match.fullName}</span>
                        <span className="block text-small text-ink-secondary">
                          {[match.email, match.phone, match.rollNumber].filter(Boolean).join(" · ")}
                        </span>
                        {match.enrollmentStatus ? (
                          <span className="mt-1 block text-small font-medium text-indigo">
                            Already {match.enrollmentStatus} in this course
                            {match.enrollmentStatus === "active" ? "" : " — enrolling reactivates it"}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
        </div>
      ) : null}

      {selected && selected.enrollmentStatus !== "active" ? (
        <div className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-3 sm:items-end">
          <Field id="startsAt" label="Access from" required>
            <Input
              id="startsAt"
              type="date"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
            />
          </Field>
          <Field id="endsAt" label="Access until" hint="Blank for no end date.">
            <Input
              id="endsAt"
              type="date"
              value={endsAt}
              min={startsAt}
              onChange={(event) => setEndsAt(event.target.value)}
            />
          </Field>
          <Button onClick={enrol} disabled={enrolling || !startsAt}>
            {enrolling ? "Enrolling…" : `Enrol ${selected.fullName.split(" ")[0]}`}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export function EnrollmentStatusButton({
  courseId,
  enrollmentId,
  status,
  name,
}: {
  courseId: string;
  enrollmentId: string;
  status: string;
  name: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  const next = status === "active" ? "suspended" : "active";

  function run() {
    if (next === "suspended" && !window.confirm(`Suspend ${name}? They lose access to this course, including its tests, until reactivated.`)) {
      return;
    }

    startTransition(async () => {
      const result = await setEnrollmentStatusAction({ courseId, enrollmentId, status: next });

      if (!result.ok) {
        showToast("error", result.message);
        return;
      }

      showToast("success", next === "active" ? `${name} reactivated.` : `${name} suspended.`);
      router.refresh();
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={run} disabled={pending}>
      {next === "active" ? "Reactivate" : "Suspend"}
    </Button>
  );
}
