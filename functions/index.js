const {
  onCall,
  onRequest,
  HttpsError,
} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

exports.helloWorld = onRequest((_request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase Functions!");
});

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { createUsageLogHandler } = require("./usage-logs.cjs");
const { createSetUserRoleHandler } = require("./user-roles.cjs");

initializeApp();

exports.setUserRole = onCall(
  { timeoutSeconds: 15, maxInstances: 5 },
  createSetUserRoleHandler({ auth: getAuth(), HttpsError }),
);

exports.recordUsage = onCall(
  { timeoutSeconds: 15, maxInstances: 10 },
  createUsageLogHandler({ logger, HttpsError }),
);
