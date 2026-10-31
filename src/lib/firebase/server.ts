import "server-only";

import { headers } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { readUserRole, type UserRole } from "@/lib/role";
import { getAdminAuth } from "./admin";

type FirebaseServerSession = {
  isBridgeActive: boolean;
  role: UserRole;
  userId: string | null;
};

function readBearerToken(requestHeaders: Headers) {
  const authorization = requestHeaders.get("authorization");
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
}

// Codes `verifyIdToken` uses when the token itself is the problem.
const TOKEN_REJECTION_CODES = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/user-disabled",
  "auth/user-not-found",
]);

function isTokenRejection(error: unknown) {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && TOKEN_REJECTION_CODES.has(code);
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
  console.error("Firebase ID token verification failed", {
    code,
    message,
    ...(causeMessage ? { cause: causeMessage } : {}),
  });

  if (process.env.NODE_ENV !== "development") return;

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

async function verifyIdToken(authIdToken: string) {
  // Dynamic rendering errors must not be interpreted as invalid user tokens.
  await connection();
  try {
    // checkRevoked rejects tokens of disabled users and revoked sessions, so a
    // demoted role stops working as soon as its refresh tokens are revoked.
    const claims = await getAdminAuth().verifyIdToken(authIdToken, true);
    return { role: readUserRole(claims), userId: claims.uid };
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
 * Reads only a worker-injected, refreshed ID token. An absent worker is not an
 * unauthenticated verdict: the worker covers only navigation and RSC requests,
 * and the browser gate remains the first-load fallback until it controls the
 * tab. Authorization must use `verifySession` or `verifyRole` under
 * `src/app/(protected)/_lib/dal.ts`, which fail closed.
 *
 * `cache` shares one revocation-aware verification across a render pass. It has
 * no effect in Server Functions and Route Handlers, which verify on every call.
 */
export const getFirebaseServerSession = cache(
  async (): Promise<FirebaseServerSession> => {
    const requestHeaders = await headers();
    const isBridgeActive = requestHeaders.get("x-firebase-auth-bridge") === "1";
    const authIdToken = readBearerToken(requestHeaders);

    if (!isBridgeActive || !authIdToken) {
      return { isBridgeActive, role: readUserRole({}), userId: null };
    }

    return { isBridgeActive, ...(await verifyIdToken(authIdToken)) };
  },
);
