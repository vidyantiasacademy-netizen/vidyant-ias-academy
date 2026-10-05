"use client";

import { onIdTokenChanged, type User as FirebaseUser } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

import { refreshSessionCookie } from "./client";
import { isAtLeast } from "./roles";
import type { Role } from "./types";

/**
 * Client-side auth state, for UI that has to react to sign-in without a
 * navigation: a header avatar, a disabled submit button, a real-time listener
 * that needs the current uid.
 *
 * This is presentation state, not authorisation. `role` here comes from the ID
 * token in the browser and must never be the only thing standing between a user
 * and an action — the server re-checks it in `requireRole()`, and Firestore
 * re-checks it in the rules. Mount the provider inside the portal layouts
 * rather than the root layout, so the marketing pages stay fully static and
 * never load the Firebase Auth chunk.
 */

interface AuthState {
  user: FirebaseUser | null;
  role: Role | null;
  /** True until the first `onIdTokenChanged` callback fires. */
  loading: boolean;
  isAtLeast: (minimum: Role) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  // Starts false when there is no Firebase project: there will never be a
  // sign-in callback to wait for, and resolving it in the effect instead would
  // be a synchronous setState that cascades a second render.
  const [loading, setLoading] = useState(() => isFirebaseConfigured());

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    return onIdTokenChanged(getFirebaseAuth(), async (next) => {
      setUser(next);

      if (!next) {
        setRole(null);
        setLoading(false);
        return;
      }

      const token = await next.getIdTokenResult();
      setRole((token.claims.role as Role | undefined) ?? "STUDENT");
      setLoading(false);

      // Keep the httpOnly cookie in step with the refreshed token, so a role
      // change lands server-side without forcing a re-login.
      await refreshSessionCookie(next).catch(() => undefined);
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      role,
      loading,
      isAtLeast: (minimum: Role) => (role ? isAtLeast(role, minimum) : false),
    }),
    [user, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }

  return context;
}
