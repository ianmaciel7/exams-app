"use server";

import {
  type ApiKey,
  type ApiKeySummary,
  apiKeyLabel,
  generateApiKey,
  hashApiKey,
} from "@/domain/api-keys";
import { firebase } from "@/lib/firebase/admin";
import { authorized, idSchema } from "@/lib/firebase/session";

async function owner(spaceId: string) {
  const { caller, space } = await authorized(spaceId);
  if (space.ownerId !== caller.uid)
    throw new Error("Only the Space owner can manage API keys.");
  return caller;
}

// The raw key is returned here and never again — only its SHA-256 hash is
// persisted, so a leaked database cannot be replayed against /api/mcp.
export async function createSpaceApiKey(spaceId: string, label: string) {
  const caller = await owner(spaceId);
  const raw = generateApiKey();
  const doc = await firebase()
    .db.collection("api_keys")
    .add({
      keyHash: hashApiKey(raw),
      spaceId,
      createdBy: caller.uid,
      createdAt: new Date().toISOString(),
      revokedAt: null,
      label: apiKeyLabel.parse(label),
      scopes: ["read"],
    } satisfies Omit<ApiKey, "id">);
  return { id: doc.id, key: raw };
}

export async function listSpaceApiKeys(
  spaceId: string,
): Promise<ApiKeySummary[]> {
  await owner(spaceId);
  const result = await firebase()
    .db.collection("api_keys")
    .where("spaceId", "==", spaceId)
    .get();
  return result.docs
    .map((doc) => {
      const { keyHash: _, ...summary } = doc.data() as Omit<ApiKey, "id">;
      return { ...summary, id: doc.id };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function revokeSpaceApiKey(spaceId: string, keyId: string) {
  await owner(spaceId);
  const ref = firebase().db.collection("api_keys").doc(idSchema.parse(keyId));
  await firebase().db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (doc.data()?.spaceId !== spaceId) throw new Error("Key not found.");
    tx.update(ref, { revokedAt: new Date().toISOString() });
  });
}
