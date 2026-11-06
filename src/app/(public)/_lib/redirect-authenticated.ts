import "server-only";

import { redirect } from "next/navigation";
import { getSafeReturnUrl } from "@/lib/return-url";
import { getSession } from "@/lib/session";

/**
 * Send a visitor with a server-verified session away from a public
 * authentication page, back to the validated `next` destination or the home.
 */
export async function redirectAuthenticated(
  next: string | string[] | undefined,
): Promise<void> {
  const session = await getSession();
  if (!session.isAuthenticated) return;
  redirect(getSafeReturnUrl(typeof next === "string" ? next : undefined));
}
