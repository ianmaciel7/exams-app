import "server-only";

import { cache } from "react";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getFirebaseServerSession } from "@/lib/firebase/server";
import { cookies } from "@/lib/headers";
import type { UserRole } from "@/lib/role";

export const SESSION_COOKIE_NAME = "__session";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const FIVE_DAYS_SEC = 5 * 24 * 60 * 60;

function getErrorMessageAndCode(error: unknown): {
  code: string | undefined;
  message: string;
} {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    const code = (error as { code: string }).code;
    const message =
      error instanceof Error ? error.message : "Unknown Firebase Auth error";
    return { code, message };
  }

  if (error instanceof Error) {
    return { code: undefined, message: error.message };
  }

  return { code: undefined, message: "Unknown error" };
}

function logSessionCreationFailure(code: string | undefined, message: string) {
  const isEmulatorActive = Boolean(
    process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim() ||
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST?.trim(),
  );

  if (code === "auth/user-not-found" && isEmulatorActive) {
    const currentProject =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
    console.error(
      `Failed to create Firebase session cookie [${code}]: User not found in emulator project "${currentProject}". ` +
        "Verify that NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local matches the project passed to the emulator (e.g. demo-test).",
    );
    return;
  }

  const prefix = code ? ` [${code}]` : "";
  console.error(
    `Failed to create Firebase session cookie${prefix}: ${message}`,
  );
}

export async function createSession(idToken: string): Promise<void> {
  const adminAuth = getAdminAuth();
  // Minting a cookie alone does not check revocation. A refreshed ID token can
  // retain the revoked auth_time, so returning 200 here would restart the loop.
  await adminAuth.verifyIdToken(idToken, true);
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: FIVE_DAYS_MS,
  });
  // Use the same verdict as the protected DAL before acknowledging the session.
  await adminAuth.verifySessionCookie(sessionCookie, true);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    maxAge: FIVE_DAYS_SEC,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/** Log a failed session creation and return its Firebase error code. */
export function describeSessionFailure(error: unknown): {
  code: string | undefined;
  message: string;
} {
  const failure = getErrorMessageAndCode(error);
  logSessionCreationFailure(failure.code, failure.message);
  return failure;
}

export type Session = {
  userId: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  /** Name claim of the verified token, when the account has one. */
  displayName?: string | null;
};

/**
 * Read and verify the active session cookie. Memoized with React `cache()`
 * across a single render pass. It never redirects, so it is safe for public
 * routes and conditional rendering.
 */
export const getSession = cache(async (): Promise<Session> => {
  const session = await getFirebaseServerSession();
  return {
    userId: session.userId,
    role: session.role,
    isAuthenticated: Boolean(session.userId),
    displayName: session.displayName ?? null,
  };
});

/** Delete the session cookie on the server. */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
