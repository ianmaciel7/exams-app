function parseEmails(value) {
  return new Set(
    String(value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Decide who may use the app. Admin addresses are allowed implicitly. Outside the
 * emulator an empty allowlist refuses everyone, so a missing deploy value can never
 * open registration.
 */
function createAccessPolicy({ allowedEmails, adminEmails, emulator = false }) {
  const allowed = parseEmails(allowedEmails);
  const admins = parseEmails(adminEmails);
  const open = emulator && allowed.size === 0 && admins.size === 0;

  return {
    isAllowed(email) {
      if (open) return true;
      const normalized = String(email ?? "").toLowerCase();
      return allowed.has(normalized) || admins.has(normalized);
    },
    roleFor(email, emailVerified) {
      const normalized = String(email ?? "").toLowerCase();
      return admins.has(normalized) && emailVerified === true
        ? "admin"
        : "user";
    },
    requiresVerifiedEmail: !open,
  };
}

function createBeforeCreateHandler({ getPolicy, HttpsError }) {
  return (event) => {
    const policy = getPolicy();
    const { email, emailVerified } = event.data;
    if (!policy.isAllowed(email)) {
      throw new HttpsError("permission-denied", "This account cannot sign up.");
    }
    return { customClaims: { role: policy.roleFor(email, emailVerified) } };
  };
}

function createBeforeSignInHandler({ getPolicy, HttpsError }) {
  return (event) => {
    const policy = getPolicy();
    const { email, emailVerified } = event.data;
    if (!policy.isAllowed(email)) {
      throw new HttpsError("permission-denied", "This account cannot sign in.");
    }
    if (policy.requiresVerifiedEmail && emailVerified !== true) {
      throw new HttpsError(
        "permission-denied",
        "Verify the email address before signing in.",
      );
    }
    return { customClaims: { role: policy.roleFor(email, emailVerified) } };
  };
}

module.exports = {
  createAccessPolicy,
  createBeforeCreateHandler,
  createBeforeSignInHandler,
  parseEmails,
};
