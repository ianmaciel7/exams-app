import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";
import { redirectToSignIn } from "@/lib/navigation";
import { hasRole, type UserRole } from "@/lib/role";
import { getSession } from "@/lib/session";

/**
 * Authentication boundary for protected data and operations. It fails closed:
 * without a server-verified identity, the caller is sent to sign-in.
 */
export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session.isAuthenticated || !session.userId) redirectToSignIn();
  return { role: session.role, userId: session.userId };
});

/**
 * Authorization boundary on top of `verifySession`: an insufficient role is
 * answered as not found so privileged routes are not disclosed. Callers still
 * check ownership of the requested resource.
 */
export const verifyRole = cache(async (required: UserRole) => {
  const session = await verifySession();
  if (!hasRole(session.role, required)) notFound();
  return session;
});
