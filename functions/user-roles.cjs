const roles = new Set(["user", "admin"]);

function isRoleRequest(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    Object.keys(data).length === 2 &&
    typeof data.uid === "string" &&
    data.uid.length > 0 &&
    typeof data.role === "string" &&
    roles.has(data.role)
  );
}

function requireCallableAdmin(request, HttpsError) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Administrator role required.");
  }
}

async function requireCurrentAdmin(request, auth, HttpsError) {
  // The callable automatically verifies signatures but not token revocation.
  const authorization = request.rawRequest?.headers?.authorization;
  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  let verified;
  try {
    verified = await auth.verifyIdToken(
      authorization.slice("Bearer ".length),
      true,
    );
  } catch {
    throw new HttpsError("permission-denied", "Administrator session revoked.");
  }
  if (verified.uid !== request.auth.uid || verified.role !== "admin") {
    throw new HttpsError("permission-denied", "Administrator role required.");
  }

  // Current claims are authoritative even while an old admin token survives.
  const caller = await auth.getUser(request.auth.uid);
  if (caller.disabled || caller.customClaims?.role !== "admin") {
    throw new HttpsError("permission-denied", "Administrator role required.");
  }
}

function createSetUserRoleHandler({ auth, HttpsError }) {
  return async (request) => {
    requireCallableAdmin(request, HttpsError);

    const data = request.data;
    if (!isRoleRequest(data)) {
      throw new HttpsError("invalid-argument", "Unsupported role request.");
    }
    if (data.uid === request.auth.uid && data.role !== "admin") {
      throw new HttpsError(
        "failed-precondition",
        "Administrators cannot remove their own role.",
      );
    }

    await requireCurrentAdmin(request, auth, HttpsError);
    const user = await auth.getUser(data.uid);
    await auth.setCustomUserClaims(data.uid, {
      ...user.customClaims,
      role: data.role,
    });
    await auth.revokeRefreshTokens(data.uid);
    return { uid: data.uid, role: data.role };
  };
}

module.exports = { createSetUserRoleHandler };
