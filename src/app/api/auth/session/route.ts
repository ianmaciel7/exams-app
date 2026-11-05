import "server-only";

import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { deleteSession, SESSION_COOKIE_NAME } from "@/lib/session";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const FIVE_DAYS_SEC = 5 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { idToken?: unknown };
    if (typeof body?.idToken !== "string" || !body.idToken) {
      return NextResponse.json({ error: "Invalid idToken" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    const sessionCookie = await adminAuth.createSessionCookie(body.idToken, {
      expiresIn: FIVE_DAYS_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      maxAge: FIVE_DAYS_SEC,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Failed to create Firebase session cookie", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  await deleteSession();
  return NextResponse.json({ status: "success" });
}
