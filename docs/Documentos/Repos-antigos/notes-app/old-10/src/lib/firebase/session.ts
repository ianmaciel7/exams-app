import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import type { Space } from "@/domain/recall";
import { firebase } from "@/lib/firebase/admin";

export const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/);

// Not a "use server" module on purpose: these are internal helpers shared by
// the action files, and exporting them from one would publish them to the
// client as callable Server Actions.
export async function user() {
  const token = (await cookies()).get("recall-session")?.value;
  if (!token) throw new Error("Please sign in to continue.");
  return firebase().auth.verifySessionCookie(token, true);
}

export async function authorized(spaceId: string) {
  idSchema.parse(spaceId);
  const caller = await user();
  const doc = await firebase().db.collection("spaces").doc(spaceId).get();
  if (!doc.exists || !doc.data()?.members.includes(caller.uid))
    throw new Error("Space not found.");
  return { caller, space: { ...doc.data(), id: doc.id } as Space };
}
