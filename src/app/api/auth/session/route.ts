import "server-only";

import { badRequest, type NextRequest, ok, unauthorized } from "@/lib/server";
import {
  createSession,
  deleteSession,
  describeSessionFailure,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { idToken?: unknown };
    if (typeof body?.idToken !== "string" || !body.idToken) {
      return badRequest({ error: "Invalid idToken" });
    }

    await createSession(body.idToken);
    return ok({ status: "success" });
  } catch (error) {
    const { code } = describeSessionFailure(error);

    await deleteSession();
    return unauthorized(
      { error: "Failed to create session", code: code ?? "unknown" },
      {
        challenge: { scheme: "Bearer", parameters: { error: "invalid_token" } },
      },
    );
  }
}

export async function DELETE() {
  await deleteSession();
  return ok({ status: "success" });
}
