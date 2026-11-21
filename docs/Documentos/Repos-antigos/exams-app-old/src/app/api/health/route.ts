import { type NextRequest, NextResponse } from "next/server";

export function GET(
  _request?: NextRequest,
  _context?: RouteContext<"/api/health">,
) {
  return NextResponse.json({ status: "ok" });
}
