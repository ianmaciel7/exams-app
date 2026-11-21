import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPrefixes = [
  "/space",
  "/question",
  "/study",
  "/review",
  "/settings",
];

// Optimistic redirect only — every Server Action re-verifies the session
// cookie itself (see src/actions/recall.ts `user()`), so this never needs to
// call the Admin SDK just to decide whether to bounce to /login.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = request.cookies.has("recall-session");
  if (pathname === "/login")
    return signedIn
      ? NextResponse.redirect(new URL("/space", request.url))
      : undefined;
  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix)))
    return signedIn
      ? undefined
      : NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/space/:path*",
    "/question/:path*",
    "/study/:path*",
    "/review/:path*",
    "/settings/:path*",
    "/login",
  ],
};
