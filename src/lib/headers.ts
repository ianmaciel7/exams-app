import { headers } from "next/headers";

/** Request header that carries the per-request CSP nonce to Server Components. */
export const nonceHeader = "x-nonce";

/** Response header that carries the Content Security Policy directive string. */
export const cspHeader = "Content-Security-Policy";

/**
 * Baseline response headers from the Next.js `headers` guide. Documents get the
 * full nonce-based CSP from `src/proxy.ts`, which replaces this header; the
 * baseline CSP below still covers public files and the auth service worker.
 */
export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: cspHeader,
    value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

/** Reads the per-request CSP nonce that `src/proxy.ts` sets. */
export async function getNonce() {
  return (await headers()).get(nonceHeader) ?? undefined;
}
