import "server-only";
import { headers } from "next/headers";
import { nonceHeader } from "./csp";

/** Reads the per-request CSP nonce that `src/proxy.ts` sets. */
export async function getNonce() {
  return (await headers()).get(nonceHeader) ?? undefined;
}
