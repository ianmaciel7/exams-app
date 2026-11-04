import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { expect, it } from "vitest";

const require = createRequire(import.meta.url);
const binary = join(
  dirname(require.resolve("@ast-grep/cli/package.json")),
  process.platform === "win32" ? "ast-grep.exe" : "ast-grep",
);

it.each(["ts", "tsx"])(
  "allows sign-in redirects only in the protected server boundary (%s)",
  (extension) => {
    const directory = mkdtempSync(join(tmpdir(), "protected-redirect-scope-"));
    const invalid = [
      `src/app/(protected)/_hooks/use-auth-guard-client.${extension}`,
      `src/app/(protected)/_hooks/use-redirect-when-unauthenticated.${extension}`,
      `src/app/(protected)/profile/_hooks/use-redirect-when-unauthenticated.${extension}`,
      `src/app/(protected)/profile/_hooks/use-profile.${extension}`,
    ];
    const excluded = [
      `src/app/(protected)/_lib/session.${extension}`,
      `src/app/(protected)/profile/_hooks/use-profile.test.${extension}`,
    ];
    try {
      for (const file of [...invalid, ...excluded]) {
        const target = join(directory, file);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, 'replaceWithSignIn("/profile?tab=account");');
      }
      const result = spawnSync(
        binary,
        [
          "scan",
          "--rule",
          resolve(
            `.ast-grep/rules/nextjs/no-protected-descendant-sign-in-redirect-${extension}.yml`,
          ),
          "--json",
          "src",
        ],
        { cwd: directory, encoding: "utf8" },
      );
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      const findings = JSON.parse(result.stdout) as Array<{ file: string }>;
      expect(
        findings.map(({ file }) => file.replaceAll("\\", "/")).sort(),
      ).toEqual(invalid.sort());
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  },
);
