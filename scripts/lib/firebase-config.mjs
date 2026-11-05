import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

export function configuredRules(config) {
  const rules = [];
  for (const service of ["firestore", "storage", "database"]) {
    if (config[service] === undefined) continue;
    const entries = Array.isArray(config[service])
      ? config[service]
      : [config[service]];
    if (!entries.length)
      throw new Error(`firebase.json: ${service} configuration is empty`);
    for (const entry of entries) {
      const path = entry?.rules;
      if (
        typeof path !== "string" ||
        !path.trim() ||
        isAbsolute(path) ||
        path.startsWith("\\") ||
        /^[A-Za-z]:/.test(path) ||
        path.replaceAll("\\", "/").split("/").includes("..")
      ) {
        throw new Error(
          `firebase.json: ${service}.rules must be a repository-relative file path`,
        );
      }
      rules.push({
        service,
        rules: path.replaceAll("\\", "/"),
        target: entry.database ?? entry.target,
      });
    }
  }
  return rules;
}

export function readFirebaseConfig(root) {
  return JSON.parse(readFileSync(resolve(root, "firebase.json"), "utf8"));
}

export function rulesPathFor(config, service, target) {
  const matches = configuredRules(config).filter(
    (entry) =>
      entry.service === service &&
      (target === undefined || entry.target === target),
  );
  if (matches.length !== 1) {
    throw new Error(
      `firebase.json: expected one rules file for ${service}; select a configured target when multiple entries exist`,
    );
  }
  return matches[0].rules;
}
