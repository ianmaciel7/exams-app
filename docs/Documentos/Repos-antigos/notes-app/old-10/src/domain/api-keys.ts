import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

export const keyPrefix = "rcl_live_";
export const keyLength = 32;
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const apiKeyPattern = new RegExp(
  `^${keyPrefix}[0-9A-Za-z]{${keyLength}}$`,
);
export const apiKeyLabel = z.string().trim().min(1).max(80);

export type ApiKey = {
  id: string;
  keyHash: string;
  spaceId: string;
  createdBy: string;
  createdAt: string;
  revokedAt: string | null;
  label: string;
  scopes: "read"[];
  lastUsedAt?: string;
};
export type ApiKeySummary = Omit<ApiKey, "keyHash">;

export function generateApiKey() {
  let body = "";
  while (body.length < keyLength) {
    for (const byte of randomBytes(keyLength)) {
      // 62 does not divide 256, so bytes in the final partial block are
      // rejected rather than folded in — otherwise the first 8 symbols of the
      // alphabet would be drawn more often than the rest.
      if (byte >= 248) continue;
      body += alphabet[byte % alphabet.length];
      if (body.length === keyLength) break;
    }
  }
  return `${keyPrefix}${body}`;
}

export function hashApiKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function isApiKey(raw: string) {
  return apiKeyPattern.test(raw);
}

export function bearerToken(header: string | null) {
  const match = /^Bearer (\S+)$/.exec(header ?? "");
  return match && isApiKey(match[1]) ? match[1] : null;
}
