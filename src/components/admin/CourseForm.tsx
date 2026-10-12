"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type SubmitEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createCourseAction, updateCourseAction } from "@/lib/courses/actions";
import type { Course, CourseCategory, DeliveryMode, PublishStatus } from "@/types/db";

/**
 * Creates or edits a course's operational record — what the app needs to grant
 * access and attach tests. The public course page (curriculum, imagery) is
 * written in Sanity; `sanitySlug` joins the two.
 */

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  foundation: "Foundation",
  prelims: "Prelims",
  mains: "Mains",
  optional: "Optional subject",
  "test-series": "Test series",
};

const MODE_LABELS: Record<DeliveryMode, string> = {
  offline: "Classroom",
  "online-live": "Online live",
  recorded: "Recorded",
  hybrid: "Hybrid",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function CourseForm({ course }: { course?: Course }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [title, setTitle] = useState(course?.title ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  // A new course's slug follows its title until someone edits the slug itself.
  const [slugTouched, setSlugTouched] = useState(Boolean(course));
  const [category, setCategory] = useState<CourseCategory>(course?.category ?? "foundation");
  const [modes, setModes] = useState<DeliveryMode[]>(course?.modes ?? ["offline"]);
  const [price, setPrice] = useState(
    course?.price ? String(course.price.amountInPaise / 100) : "",
  );
  const [durationMonths, setDurationMonths] = useState(
    course?.durationMonths ? String(course.durationMonths) : "",
  );
  const [status, setStatus] = useState<PublishStatus>(course?.status ?? "draft");
  const [sanitySlug, setSanitySlug] = useState(course?.sanitySlug ?? "");

  function toggleMode(mode: DeliveryMode, on: boolean) {
    setModes((current) => (on ? [...current, mode] : current.filter((m) => m !== mode)));
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const fields = {
      title: title.trim(),
      slug: slug.trim(),
      category,
      modes,
      price: price.trim()
        ? { amountInPaise: Math.round(Number(price) * 100), currency: "INR" as const }
        : null,
      durationMonths: durationMonths.trim() ? Number(durationMonths) : null,
      status,
      // Blank means the Sanity page shares the course slug, which is the usual
      // case — a null here would keep the course off the public catalogue.
      sanitySlug: sanitySlug.trim() || slug.trim(),
    };

    startTransition(async () => {
      const result = course
        ? await updateCourseAction({ courseId: course.id, fields })
        : await createCourseAction(fields);

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        showToast("error", result.message);
        return;
      }

      setErrors({});
      showToast("success", course ? "Course saved." : "Course created.");
      router.push(`/admin/courses/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card padding="md" className="grid gap-5 sm:grid-cols-2">
        <Field id="title" label="Course name" required error={errors.title?.[0]} className="sm:col-span-2">
          <Input
            id="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            placeholder="Prelims Test Series 2027"
            aria-invalid={Boolean(errors.title) || undefined}
          />
        </Field>

        <Field
          id="slug"
          label="Short ID"
          required
          hint="Lowercase letters, numbers and hyphens. Used in links."
          error={errors.slug?.[0]}
        >
          <Input
            id="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            aria-invalid={Boolean(errors.slug) || undefined}
          />
        </Field>

        <Field id="category" label="Category" required>
          <Select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value as CourseCategory)}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <fieldset className="sm:col-span-2">
          <legend className="text-small font-medium text-indigo">
            How it is taught <span className="text-kesar-600" aria-hidden>*</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-body">
            {Object.entries(MODE_LABELS).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 accent-indigo"
                  checked={modes.includes(value as DeliveryMode)}
                  onChange={(event) => toggleMode(value as DeliveryMode, event.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
          {errors.modes ? (
            <p role="alert" className="mt-1.5 text-small font-medium text-danger">
              Pick at least one.
            </p>
          ) : null}
        </fieldset>

        <Field
          id="price"
          label="Fee (₹)"
          hint="Leave blank if the fee is quoted on a counselling call."
          error={errors.price?.[0]}
        >
          <Input
            id="price"
            type="number"
            inputMode="decimal"
            min={0}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </Field>

        <Field id="durationMonths" label="Duration (months)" error={errors.durationMonths?.[0]}>
          <Input
            id="durationMonths"
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            value={durationMonths}
            onChange={(event) => setDurationMonths(event.target.value)}
          />
        </Field>

        <Field
          id="status"
          label="Status"
          required
          hint="Draft courses are hidden from the public course list, but students can still be enrolled."
        >
          <Select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as PublishStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>

        <Field
          id="sanitySlug"
          label="Website page slug"
          hint="The slug of this course's page in Sanity Studio. Leave blank if it matches the slug above."
          error={errors.sanitySlug?.[0]}
        >
          <Input
            id="sanitySlug"
            value={sanitySlug}
            placeholder={slug.trim() || undefined}
            onChange={(event) => setSanitySlug(event.target.value)}
          />
        </Field>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <ButtonLink href={course ? `/admin/courses/${course.id}` : "/admin/courses"} variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : course ? "Save course" : "Create course"}
        </Button>
      </div>
    </form>
  );
}
