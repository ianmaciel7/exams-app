import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function validateEmulatorSnapshot({
  scripts,
  metadata,
  accounts,
  directories,
}) {
  const errors = [];
  for (const script of [scripts.emulator, scripts["emulator:export"]])
    if (!script?.includes("--project demo-test"))
      errors.push("emulator commands must target demo-test");
  for (const entry of Object.values(metadata).filter((entry) => entry?.path))
    if (!directories.has(entry.path))
      errors.push(`missing emulator export: ${entry.path}`);
  const users = accounts.users ?? [];
  if (!users.length) errors.push("Auth snapshot must contain test users");
  for (const user of users)
    if (!user.email?.endsWith("@example.test") || !user.displayName)
      errors.push(
        "Auth snapshot users must use fictional example.test identities with display names",
      );
  if (
    !users.some((user) =>
      user.providerUserInfo?.some(
        (provider) => provider.providerId === "google.com",
      ),
    )
  )
    errors.push("Auth snapshot must contain a fictional Google provider user");
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  const data = resolve(root, "emulator-data");
  const metadata = JSON.parse(
    readFileSync(resolve(data, "firebase-export-metadata.json"), "utf8"),
  );
  const accounts = JSON.parse(
    readFileSync(resolve(data, "auth_export", "accounts.json"), "utf8"),
  );
  const errors = validateEmulatorSnapshot({
    scripts: pkg.scripts,
    metadata,
    accounts,
    directories: new Set(
      readdirSync(data, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    ),
  });
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Firebase emulator snapshot passed.");
}
