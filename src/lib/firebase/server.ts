import "server-only";

import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { readUserRole, type UserRole } from "@/lib/role";
import { getAdminAuth } from "./admin";

export type FirebaseServerSession = {
  role: UserRole;
  userId: string | null;
  displayName?: string | null;
};

const SESSION_COOKIE_NAME = "__session";

function readBearerToken(requestHeaders: Headers) {
  const authorization = requestHeaders.get("authorization");
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
}

// Codes used when the token or session cookie itself is the problem.
const TOKEN_REJECTION_CODES = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/session-cookie-expired",
  "auth/session-cookie-revoked",
  "auth/user-disabled",
  "auth/user-not-found",
]);

function isTokenRejection(error: unknown) {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && TOKEN_REJECTION_CODES.has(code);
}

function warnInDevelopment(error: unknown) {
  if (process.env.NODE_ENV !== "development") return;

  // A running emulator that rejected the token is not down.
  if (isTokenRejection(error)) return;

  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.warn(
      `[Firebase Dev] Cannot connect to Auth emulator at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}. If the emulator is stopped, start it in another terminal with 'pnpm emulator'.`,
    );
  } else {
    console.warn(
      "[Firebase Dev] Production token verification failed. Ensure Google Application Default Credentials are set with 'gcloud auth application-default login'.",
    );
  }
}

function logVerificationFailure(error: unknown) {
  const errorWithCode = error as { code?: string; cause?: { code?: string } };
  const code = errorWithCode.code ?? errorWithCode.cause?.code;
  const message = error instanceof Error ? error.message : String(error);
  const causeMessage =
    error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : undefined;

  // Log the reason, never the token, so a server-side misconfiguration is
  // not mistaken for an expired session.
  console.error("Firebase session verification failed", {
    code,
    message,
    ...(causeMessage ? { cause: causeMessage } : {}),
  });

  warnInDevelopment(error);
}

async function verifyToken(token: string, isCookie: boolean) {
  // Dynamic rendering errors must not be interpreted as invalid user tokens.
  await connection();
  try {
    const adminAuth = getAdminAuth();
    // checkRevoked rejects tokens of disabled users and revoked sessions, so a
    // demoted role stops working as soon as its refresh tokens are revoked.
    const claims = isCookie
      ? await adminAuth.verifySessionCookie(token, true)
      : await adminAuth.verifyIdToken(token, true);
    return {
      role: readUserRole(claims),
      userId: claims.uid,
      displayName: typeof claims.name === "string" ? claims.name.trim() : null,
    };
  } catch (error) {
    logVerificationFailure(error);
    // Only a bad token is an unverifiable session. Expired credentials or an
    // unreachable Auth backend are server faults: reporting them as
    // "unauthenticated" redirects to sign-in, where the still-signed-in client
    // bounces back, looping forever.
    if (!isTokenRejection(error)) throw error;
    return { role: readUserRole({}), userId: null };
  }
}

/**
 * Reads and verifies the HTTP-only Firebase session cookie (`__session`), or an
 * authorization bearer token fallback.
 *
 * `cache` shares one revocation-aware verification across a render pass.
 */
export const getFirebaseServerSession = cache(
  async (): Promise<FirebaseServerSession> => {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (sessionCookie) {
      return await verifyToken(sessionCookie, true);
    }

    const requestHeaders = await headers();
    const authIdToken = readBearerToken(requestHeaders);
    if (authIdToken) {
      return await verifyToken(authIdToken, false);
    }

    return { role: readUserRole({}), userId: null };
  },
);
