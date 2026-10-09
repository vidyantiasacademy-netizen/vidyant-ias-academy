import type { Metadata } from "next";
import { Plus, Users } from "lucide-react";

import Link from "@/i18n/Link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { cn } from "@/lib/utils/cn";
import { userService } from "@/services/users/user.service";
import { ROLES, type Role } from "@/types/db";

import { requireRolePage } from "../page-guards";

export const metadata: Metadata = {
  title: "Users",
  robots: { index: false, follow: false },
};

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function listHref(role: Role | undefined, cursor?: string): string {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (cursor) params.set("cursor", cursor);
  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

export default async function UsersPage({ searchParams }: PageProps<"/[lang]/admin/users">) {
  await requireRolePage("/admin/users", "SUPER_ADMIN");

  const params = await searchParams;
  const role = ROLES.find((value) => value === params.role);
  const cursor = typeof params.cursor === "string" ? params.cursor : null;

  const page = await userService.listAll({ role, cursor });

  // Accounts made from this panel carry the creator's uid; self sign-ups carry their own.
  const creators = await userService.getDisplayNames(
    page.items
      .map((user) => user.createdBy)
      .filter((uid, index) => uid !== "system" && uid !== page.items[index].uid),
  );

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold">Users</h1>
          <p className="mt-2 text-body text-ink-secondary">
            Every account, newest first — those added here and those who signed up on the website.
          </p>
        </div>
        <ButtonLink href="/admin/users/new" size="sm">
          <Plus aria-hidden className="size-4" />
          New user
        </ButtonLink>
      </div>

      <nav aria-label="Filter by role" className="mt-6 flex flex-wrap gap-2">
        {[undefined, ...ROLES].map((value) => (
          <Link
            key={value ?? "all"}
            href={listHref(value)}
            aria-current={value === role ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center border px-3 text-small font-medium transition-colors",
              value === role
                ? "border-indigo bg-indigo text-white"
                : "border-line text-ink-secondary hover:border-indigo hover:text-indigo",
            )}
          >
            {value ? ROLE_LABELS[value] : "All"}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {page.items.length === 0 ? (
          <EmptyState
            icon={<Users aria-hidden className="size-5" />}
            title={cursor ? "No more users" : "No users here yet"}
            description={
              role
                ? `No account has the ${ROLE_LABELS[role].toLowerCase()} role.`
                : "Create the first account, or wait for someone to sign up on the website."
            }
            action={<ButtonLink href="/admin/users/new">Create a user</ButtonLink>}
          />
        ) : (
          <Card padding="none" className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-small">
              <thead className="border-b border-line text-ink-secondary">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Contact</th>
                  <th scope="col" className="px-4 py-3 font-medium">Role</th>
                  <th scope="col" className="px-4 py-3 font-medium">Added</th>
                  <th scope="col" className="px-4 py-3 font-medium">Last sign-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {page.items.map((user) => {
                  const selfSignUp = user.createdBy === user.uid;
                  const addedBy = selfSignUp
                    ? "Signed up"
                    : user.createdBy === "system"
                      ? "System"
                      : `By ${creators[user.createdBy] ?? "a former admin"}`;

                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3">
                        <span className="font-medium text-indigo">{user.displayName}</span>
                        {!user.isActive ? (
                          <Badge tone="neutral" className="ml-2">Inactive</Badge>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">
                        <span className="block">{user.email ?? "—"}</span>
                        {user.phone ? <span className="block">{user.phone}</span> : null}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={user.role === "STUDENT" ? "neutral" : "kesar"}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">
                        <span className="block">{formatDate(user.createdAt)}</span>
                        <span className="block">{addedBy}</span>
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {cursor || page.nextCursor ? (
          <div className="mt-4 flex justify-between gap-3">
            {cursor ? (
              <ButtonLink href={listHref(role)} variant="ghost" size="sm">
                Back to newest
              </ButtonLink>
            ) : (
              <span />
            )}
            {page.nextCursor ? (
              <ButtonLink href={listHref(role, page.nextCursor)} variant="secondary" size="sm">
                Next page
              </ButtonLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
