"use server";

import { z } from "zod";

import { revalidateLocalizedPath } from "@/i18n/revalidate";
import { action, roleGuard } from "@/lib/auth/guards";
import { passwordField } from "@/lib/validation/auth";
import { emailField, nameField, phoneField } from "@/lib/validation/schemas";
import { userService } from "@/services/users/user.service";
import { ROLES } from "@/types/db";

/**
 * The user screens' server surface. SUPER_ADMIN only, mirroring
 * `userService.createUser`.
 */

const newUserSchema = z.object({
  displayName: nameField,
  email: emailField,
  // Optional: staff accounts are often email-only.
  phone: z.literal("").transform(() => null).or(phoneField),
  role: z.enum(ROLES),
  password: passwordField,
  // Size and type are checked again in `storageService` — this only shapes it.
  photo: z.instanceof(File).optional(),
});

export const createUserAction = action(
  roleGuard("SUPER_ADMIN"),
  newUserSchema,
  async ({ photo, ...input }) => {
    const user = await userService.createUser({
      ...input,
      photo: photo
        ? { bytes: await photo.arrayBuffer(), contentType: photo.type, fileName: photo.name }
        : null,
    });

    revalidateLocalizedPath("/admin/users");
    return { uid: user.uid };
  },
);
