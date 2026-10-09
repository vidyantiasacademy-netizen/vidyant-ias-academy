import { redirect } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { isAtLeast } from "@/lib/auth/roles";
import { requireAuthPage } from "@/lib/auth/server";
import { enquiryService } from "@/services/enquiries/enquiry.service";

/**
 * Admin overview.
 *
 * Like the student dashboard, this is the seam rather than the feature: it
 * proves a role-gated server read works, and is where the enquiry pipeline,
 * student table, batch management, test authoring and payment reconciliation
 * screens attach.
 */
export default async function AdminOverviewPage() {
  // Redirect rather than throw, and repeat the layout's check rather than rely
  // on it. Next renders a layout and its page concurrently, so a throwing guard
  // here fires before the layout's redirect lands — which logged a spurious
  // FORBIDDEN on every student who hit /admin. The redirect is idempotent.
  const session = await requireAuthPage("/admin");
  if (!isAtLeast(session.role, "COUNSELLOR")) redirect("/dashboard");

  const newEnquiries = await enquiryService
    .list({ status: "new" }, { limit: 5 })
    .catch(() => ({ items: [], nextCursor: null }));

  return (
    <>
      <h1 className="text-h2 font-bold">Overview</h1>
      <p className="mt-2 text-body text-ink-secondary">
        Signed in as {session.role.replace("_", " ").toLowerCase()}.
      </p>

      <section aria-labelledby="new-enquiries" className="mt-10">
        <h2 id="new-enquiries" className="text-h3 font-bold">
          New enquiries
        </h2>

        <Card tone="white" padding="md" className="mt-5">
          {newEnquiries.items.length === 0 ? (
            <p className="text-body text-ink-secondary">
              Nothing waiting. Website form submissions appear here as soon as they
              arrive.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {newEnquiries.items.map((enquiry) => (
                <li key={enquiry.id} className="flex flex-wrap gap-x-4 gap-y-1 py-3">
                  <span className="font-medium">{enquiry.name}</span>
                  <span className="text-ink-secondary">{enquiry.phone}</span>
                  <span className="ml-auto text-small text-ink-secondary">
                    {enquiry.form}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </>
  );
}
