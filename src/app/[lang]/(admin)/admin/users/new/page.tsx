import type { Metadata } from "next";

import { UserForm } from "@/components/admin/UserForm";

import { requireRolePage } from "../../page-guards";

export const metadata: Metadata = {
  title: "New user",
  robots: { index: false, follow: false },
};

export default async function NewUserPage() {
  await requireRolePage("/admin/users/new", "SUPER_ADMIN");

  return (
    <>
      <h1 className="text-h2 font-semibold">New user</h1>
      <p className="mt-2 text-body text-ink-secondary">
        Creates the sign-in and sets the role in one step. A student added here can be enrolled
        straight away, without signing in first.
      </p>

      <div className="mt-8 max-w-3xl">
        <UserForm />
      </div>
    </>
  );
}
