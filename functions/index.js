const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { createUsageLogHandler } = require("./usage-logs.cjs");
const { createSetUserRoleHandler } = require("./user-roles.cjs");
const {
  beforeUserCreated,
  beforeUserSignedIn,
} = require("firebase-functions/v2/identity");
const { defineString } = require("firebase-functions/params");
const {
  createAccessPolicy,
  createBeforeCreateHandler,
  createBeforeSignInHandler,
} = require("./access-policy.cjs");

initializeApp();

exports.setUserRole = onCall(
  { timeoutSeconds: 15, maxInstances: 5 },
  createSetUserRoleHandler({ auth: getAuth(), HttpsError }),
);

exports.recordUsage = onCall(
  { timeoutSeconds: 15, maxInstances: 10 },
  createUsageLogHandler({ logger, HttpsError }),
);

// The address lists come from Functions parameters (`functions/.env.<project>` at deploy,
// never committed). See docs/adr/0017-restrict-sign-in-to-an-email-allowlist.md.
const allowedEmails = defineString("ALLOWED_USER_EMAILS", { default: "" });
const adminEmails = defineString("ADMIN_USER_EMAILS", { default: "" });

function getAccessPolicy() {
  return createAccessPolicy({
    allowedEmails: allowedEmails.value(),
    adminEmails: adminEmails.value(),
    emulator: process.env.FUNCTIONS_EMULATOR === "true",
  });
}

exports.restrictSignUp = beforeUserCreated(
  createBeforeCreateHandler({ getPolicy: getAccessPolicy, HttpsError }),
);

exports.restrictSignIn = beforeUserSignedIn(
  createBeforeSignInHandler({ getPolicy: getAccessPolicy, HttpsError }),
);
