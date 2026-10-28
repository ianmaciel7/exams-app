import "server-only";

import { headers } from "next/headers";
import { connection } from "next/server";
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

async function verifyIdToken(authIdToken: string) {
  // Dynamic rendering errors must not be interpreted as invalid user tokens.
  await connection();
  try {
    // checkRevoked rejects tokens of disabled users and revoked sessions, so a
    // demoted role stops working as soon as its refresh tokens are revoked.
    const claims = await getAdminAuth().verifyIdToken(authIdToken, true);
    return { role: readUserRole(claims), userId: claims.uid };
  } catch {
    // A malformed or revoked bearer token is an unverifiable session, not a
    // server fault.
    return { role: readUserRole({}), userId: null };
  }
}

/**
 * Reads only a worker-injected, refreshed ID token. An absent worker is not an
 * unauthenticated verdict: the existing browser guard remains the first-load
 * fallback until the worker controls the tab. Authorization that must not
 * depend on that fallback belongs in `requireRole` under
 * `src/app/(protected)/_lib/require-protected-access.ts`.
 */
export async function getFirebaseServerSession(): Promise<FirebaseServerSession> {
  const requestHeaders = await headers();
  const isBridgeActive = requestHeaders.get("x-firebase-auth-bridge") === "1";
  const authIdToken = readBearerToken(requestHeaders);

  if (!isBridgeActive || !authIdToken) {
    return { isBridgeActive, role: readUserRole({}), userId: null };
  }

  return { isBridgeActive, ...(await verifyIdToken(authIdToken)) };
}
