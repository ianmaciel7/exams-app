import "server-only";

import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { deleteSession, SESSION_COOKIE_NAME } from "@/lib/session";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const FIVE_DAYS_SEC = 5 * 24 * 60 * 60;

function getErrorMessageAndCode(error: unknown): {
  code: string | undefined;
  message: string;
} {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    const code = (error as { code: string }).code;
    const message =
      error instanceof Error ? error.message : "Unknown Firebase Auth error";
    return { code, message };
  }

  if (error instanceof Error) {
    return { code: undefined, message: error.message };
  }

  return { code: undefined, message: "Unknown error" };
}

function logSessionCreationFailure(code: string | undefined, message: string) {
  const isEmulatorActive = Boolean(
    process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim() ||
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST?.trim(),
  );

  if (code === "auth/user-not-found" && isEmulatorActive) {
    const currentProject =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
    console.error(
      `Failed to create Firebase session cookie [${code}]: User not found in emulator project "${currentProject}". ` +
        "Verify that NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local matches the project passed to the emulator (e.g. demo-test).",
    );
    return;
  }

  const prefix = code ? ` [${code}]` : "";
  console.error(
    `Failed to create Firebase session cookie${prefix}: ${message}`,
  );
}

async function setSessionCookie(idToken: string) {
  const adminAuth = getAdminAuth();
  // Minting a cookie alone does not check revocation. A refreshed ID token can
  // retain the revoked auth_time, so returning 200 here would restart the loop.
  await adminAuth.verifyIdToken(idToken, true);
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: FIVE_DAYS_MS,
  });
  // Use the same verdict as the protected DAL before acknowledging the session.
  await adminAuth.verifySessionCookie(sessionCookie, true);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    maxAge: FIVE_DAYS_SEC,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { idToken?: unknown };
    if (typeof body?.idToken !== "string" || !body.idToken) {
      return NextResponse.json({ error: "Invalid idToken" }, { status: 400 });
    }

    await setSessionCookie(body.idToken);
    return NextResponse.json({ status: "success" });
  } catch (error) {
    const { code, message } = getErrorMessageAndCode(error);
    logSessionCreationFailure(code, message);

    await deleteSession();
    return NextResponse.json(
      { error: "Failed to create session", code: code ?? "unknown" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  await deleteSession();
  return NextResponse.json({ status: "success" });
}
