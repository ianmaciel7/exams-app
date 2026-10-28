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
  "enforces private hook module scope without flagging _lib, tests or vendor code (%s)",
  (extension) => {
    const rule = resolve(
      `.ast-grep/rules/react/no-module-support-in-hooks-${extension}.yml`,
    );
    const directory = mkdtempSync(join(tmpdir(), "hook-module-scope-"));
    const invalid = [
      `src/app/_hooks/use-avatar.${extension}`,
      `src/app/(protected)/profile/_hooks/use-avatar.${extension}`,
      `src/app/_hooks/nested/use-avatar.${extension}`,
      `src/hooks/use-avatar.${extension}`,
    ];
    const excluded = [
      `src/app/(protected)/profile/_lib/avatar.${extension}`,
      `src/hooks/use-mobile.${extension}`,
      `src/components/firebase/use-avatar.${extension}`,
      `src/app/_hooks/use-avatar.test.${extension}`,
      `src/app/_hooks/use-avatar.spec.${extension}`,
      `src/app/_hooks/use-avatar.stories.${extension}`,
    ];
    try {
      for (const file of [...invalid, ...excluded]) {
        const target = join(directory, file);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(
          target,
          "const LIMIT = 10; export function useAvatar() { return LIMIT; }",
        );
      }
      writeFileSync(
        join(directory, `src/app/_hooks/use-valid.${extension}`),
        "export function useValid() { const limit = 10; return () => limit; }",
      );
      const result = spawnSync(
        binary,
        ["scan", "--rule", rule, "--json", "src"],
        {
          cwd: directory,
          encoding: "utf8",
        },
      );
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      const findings = JSON.parse(result.stdout) as Array<{
        file: string;
        ruleId: string;
      }>;
      expect(
        findings.map(({ file }) => file.replaceAll("\\", "/")).sort(),
      ).toEqual(invalid.sort());
      expect(
        findings.every(
          ({ ruleId }) => ruleId === `no-module-support-in-hooks-${extension}`,
        ),
      ).toBe(true);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  },
);
