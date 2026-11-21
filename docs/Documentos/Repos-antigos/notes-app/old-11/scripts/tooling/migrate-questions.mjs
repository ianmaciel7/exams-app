#!/usr/bin/env node
// Usage: node scripts/tooling/migrate-questions.mjs [--dry-run] [--project <id>]
import {
  migrateQuestions,
  parseMigrationArgs,
} from "./migrate-questions-lib.mjs";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Optional: fall back to the client's default project id.
}

const { dryRun, projectId } = parseMigrationArgs(
  process.argv.slice(2),
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "notes-app-dev"
);

try {
  const summary = await migrateQuestions({ projectId, dryRun });
  const verb = dryRun ? "would migrate" : "migrated";
  for (const { path, type, notes } of summary.migrated) {
    const suffix = notes.length > 0 ? ` (${notes.join(", ")})` : "";
    console.log(`${verb} ${path} -> ${type}${suffix}`);
  }
  for (const { path, reason } of summary.failed) {
    console.error(`skipped ${path}: ${reason}`);
  }
  console.log(
    `${summary.migrated.length} ${verb}, ${summary.alreadyCurrent} already current, ${summary.failed.length} skipped.`
  );
  if (summary.failed.length > 0) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`migrate-questions: ${error.message}`);
  console.error("Is the emulator running? Start it with `pnpm emulator:dev`.");
  process.exit(1);
}
