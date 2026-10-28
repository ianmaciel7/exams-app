import "server-only";

import { notFound } from "next/navigation";
import { getFirebaseServerSession } from "@/lib/firebase/server";
import { redirectToSignIn, routes } from "@/lib/navigation";
import { hasRole, type UserRole } from "@/lib/role";

/**
 * Navigation check, not authorization: it tolerates the first load before the
 * worker controls the tab and acts only when the worker's token was rejected.
 * The client may still hold a session, so it must not be sent back to this
 * route after sign-in: that would loop while the token keeps failing.
 */
export async function rejectInvalidBridgeSession() {
  const session = await getFirebaseServerSession();
  if (session.isBridgeActive && !session.userId) {
    redirectToSignIn(routes.home);
  }
}

/**
 * Authentication boundary for protected data and operations. It fails closed:
 * without a server-verified identity (no worker bridge, bad or revoked token)
 * the caller is sent to sign-in. Infrastructure faults propagate.
 */
export async function verifySession() {
  const session = await getFirebaseServerSession();
  if (!session.userId) redirectToSignIn();
  return { role: session.role, userId: session.userId };
}

/**
 * Authorization boundary on top of `verifySession`: an insufficient role is
 * answered as not found so privileged routes are not disclosed. Callers still
 * check ownership of the requested resource.
 */
export async function verifyRole(required: UserRole) {
  const session = await verifySession();
  if (!hasRole(session.role, required)) notFound();
  return session;
}
