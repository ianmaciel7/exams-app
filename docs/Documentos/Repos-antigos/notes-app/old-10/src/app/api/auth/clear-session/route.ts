import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Reached when requireSnapshot() (src/lib/space.ts) finds a
// recall-session cookie that fails server-side verification. proxy.ts only
// checks cookie *presence*, so redirecting straight to /login here would
// leave the invalid cookie in place and bounce right back to /space.
export async function GET(request: Request) {
  (await cookies()).delete("recall-session");
  return NextResponse.redirect(new URL("/login", request.url));
}
