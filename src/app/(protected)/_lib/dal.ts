import "server-only";

import { notFound } from "next/navigation";
import { getFirebaseServerSession } from "@/lib/firebase/server";
import { redirectToSignIn } from "@/lib/navigation";
import { hasRole, type UserRole } from "@/lib/role";

/**
 * Redirects only when the worker bridge vouched for the request but the token
 * did not verify; otherwise the client guard remains the first-load fallback.
 */
export async function verifySession() {
  const session = await getFirebaseServerSession();
  if (session.isBridgeActive && !session.userId) redirectToSignIn();
}

/**
 * Authorization boundary for protected data and routes. Unlike the route guard,
 * it fails closed: without a server-verified session (no worker bridge, bad or
 * revoked token) the caller is sent to sign-in, and an insufficient role is
 * answered as not found so privileged routes are not disclosed.
 */
export async function verifyRole(required: UserRole) {
  const session = await getFirebaseServerSession();
  if (!session.userId) redirectToSignIn();
  if (!hasRole(session.role, required)) notFound();
  return { role: session.role, userId: session.userId };
}
