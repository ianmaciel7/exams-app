#!/usr/bin/env node
import { parseUsers, seedEmulator } from "./seed-emulator-lib.mjs";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Optional: fall back to the client's default project id.
}

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "notes-app-dev";

try {
  const results = await seedEmulator({
    projectId,
    users: parseUsers(process.argv.slice(2)),
  });
  for (const { email, uid, url } of results) {
    console.log(`seeded ${email} (${uid}) -> open ${url}`);
  }
} catch (error) {
  console.error(`seed-emulator: ${error.message}`);
  console.error("Is the emulator running? Start it with `pnpm emulator:dev`.");
  process.exit(1);
}
