import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { getFirebaseServerSession } from "@/lib/firebase/server";
import type { UserRole } from "@/lib/role";

export const SESSION_COOKIE_NAME = "__session";

export type Session = {
  userId: string | null;
  role: UserRole;
  isAuthenticated: boolean;
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
  };
});

/** Delete the session cookie on the server. */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
