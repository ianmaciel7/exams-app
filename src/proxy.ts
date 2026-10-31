import { type NextRequest, NextResponse } from "next/server";
import { buildContentSecurityPolicy, createNonce } from "@/lib/csp";
import { cspHeader, nonceHeader } from "@/lib/headers";

/**
 * Sets a per-request nonce CSP (ADR 0023). This Proxy only adds headers: it
 * never rewrites, redirects, or resolves the locale (ADR 0004 and ADR 0021).
 */
export function proxy(request: NextRequest) {
  const nonce = createNonce();
  const policy = buildContentSecurityPolicy({
    nonce,
    isDevelopment: process.env.NODE_ENV === "development",
    env: {
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_DATABASE_URL:
        process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
      NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST:
        process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST,
      NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST:
        process.env.NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST,
      NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST:
        process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST,
      NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST,
    },
  });

  // Next.js reads the nonce from the request CSP header and adds it to its
  // framework scripts; Server Components read it from `x-nonce`.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(nonceHeader, nonce);
  requestHeaders.set(cspHeader, policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(cspHeader, policy);
  return response;
}

export const config = {
  matcher: [
    {
      // Documents only: skip Next.js assets and HMR, metadata files, and public files
      // such as the auth service worker, which keep the baseline headers.
      source:
        "/((?!_next/|favicon.ico|manifest.webmanifest|.*\\.(?:js|svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
