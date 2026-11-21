import fs from "node:fs";

for (const envFile of [".env.local", ".env"]) {
  if (fs.existsSync(envFile)) {
    process.loadEnvFile(envFile);
    break;
  }
}

const rawHost =
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
if (!rawHost) {
  console.error(
    "[clear] Missing FIREBASE_AUTH_EMULATOR_HOST in environment. Define it in .env (e.g. 127.0.0.1:9099).",
  );
  process.exit(1);
}

const emulatorHost = rawHost.includes("://")
  ? rawHost.replace(/\/$/, "")
  : `http://${rawHost}`.replace(/\/$/, "");
const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
if (!projectId) {
  console.error(
    "[clear] Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID in environment. Define it in .env (e.g. demo-test).",
  );
  process.exit(1);
}

async function reportClearResult(response) {
  if (response.ok) {
    console.log(
      `[clear] Successfully cleared all accounts for project: ${projectId}`,
    );
    return;
  }

  const errorText = await response.text().catch(() => "");
  console.error(
    `[clear] Failed to clear accounts (${response.status} ${response.statusText}): ${errorText}`,
  );
  process.exitCode = 1;
}

function reportClearError(error) {
  const connectionFailure =
    error instanceof TypeError &&
    (error.message.includes("fetch failed") ||
      error.cause?.code === "ECONNREFUSED");
  if (connectionFailure) {
    console.error(
      `[clear] Unable to connect to Firebase Auth emulator at ${emulatorHost}. Start it with 'pnpm emulator'.`,
    );
    return;
  }

  console.error("[clear] Unexpected error while clearing accounts:", error);
}

export async function clearAccounts() {
  const endpoint = `${emulatorHost}/emulator/v1/projects/${projectId}/accounts`;
  console.log(
    `[clear] Clearing accounts from Firebase Auth emulator at ${emulatorHost} (project: ${projectId})...`,
  );

  try {
    const response = await fetch(endpoint, { method: "DELETE" });
    await reportClearResult(response);
  } catch (error) {
    reportClearError(error);
    process.exitCode = 1;
  }
}

await clearAccounts();
