"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type SubmitEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { createUserAction } from "@/lib/users/actions";
import { ROLES, type Role } from "@/types/db";

/**
 * Creates an account with its role already set. The super admin chooses the
 * first password and hands it over; the person can change it later through
 * "Forgot password" on the sign-in page.
 */

export function UserForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [password, setPassword] = useState("");

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (role === "SUPER_ADMIN" && !window.confirm(
      "Create another super admin? They will be able to create accounts and see every user.",
    )) {
      return;
    }

    startTransition(async () => {
      const result = await createUserAction({ displayName, email, phone, role, password });

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        showToast("error", result.message);
        return;
      }

      showToast("success", `${displayName} can now sign in with ${email}.`);
      router.push("/admin/users");
    });
  }

  const error = (field: string) => errors[field]?.[0];

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card padding="md" className="grid gap-5 sm:grid-cols-2">
        <Field id="displayName" label="Full name" required error={error("displayName")}>
          <Input
            id="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="off"
            aria-invalid={Boolean(error("displayName"))}
          />
        </Field>

        <Field id="role" label="Role" required error={error("role")}>
          <Select id="role" value={role} onChange={(event) => setRole(event.target.value as Role)}>
            {ROLES.map((value) => (
              <option key={value} value={value}>
                {ROLE_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="email" label="Email" required hint="They sign in with this." error={error("email")}>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
            aria-invalid={Boolean(error("email"))}
          />
        </Field>

        <Field id="phone" label="Mobile number" error={error("phone")}>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="9876543210"
            autoComplete="off"
            aria-invalid={Boolean(error("phone"))}
          />
        </Field>

        <Field
          id="password"
          label="First password"
          required
          hint="At least 8 characters, with a letter and a number. Share it with them privately."
          error={error("password")}
          className="sm:col-span-2"
        >
          <Input
            id="password"
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            aria-invalid={Boolean(error("password"))}
          />
        </Field>
      </Card>

      <div className="flex justify-end gap-3">
        <ButtonLink href="/admin/users" variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create user"}
        </Button>
      </div>
    </form>
  );
}
