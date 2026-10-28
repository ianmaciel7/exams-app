import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

export const root = resolve(__dirname, "../..");

const PLATFORMS: Record<string, Record<string, string>> = {
  win32: {
    x64: "@biomejs/cli-win32-x64/biome.exe",
    arm64: "@biomejs/cli-win32-arm64/biome.exe",
  },
  darwin: {
    x64: "@biomejs/cli-darwin-x64/biome",
    arm64: "@biomejs/cli-darwin-arm64/biome",
  },
  linux: {
    x64: "@biomejs/cli-linux-x64/biome",
    arm64: "@biomejs/cli-linux-arm64/biome",
  },
};

function resolveBiomeBinary(): { command: string; prefixArgs: string[] } {
  const wrapper = join(root, "node_modules/@biomejs/biome/bin/biome");
  const candidate =
    process.env.BIOME_BINARY ?? PLATFORMS[process.platform]?.[process.arch];
  if (candidate) {
    try {
      const requireFromBiome = createRequire(wrapper);
      return { command: requireFromBiome.resolve(candidate), prefixArgs: [] };
    } catch {
      // Fall back to the Node CLI wrapper when native binary resolution fails.
    }
  }
  return { command: process.execPath, prefixArgs: [wrapper] };
}

const biomeBinary = resolveBiomeBinary();

export function normalizeBiomePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

export function sweepStaleTempDirs(
  parentDirs: readonly string[],
  prefix: string,
): void {
  for (const parent of parentDirs) {
    const dirPath = join(root, parent);
    for (const entry of readdirSync(dirPath)) {
      if (entry.startsWith(prefix)) {
        rmSync(join(dirPath, entry), { recursive: true, force: true });
      }
    }
  }
}

export function createTempDirs(
  parentDirs: readonly string[],
  prefix: string,
): string[] {
  sweepStaleTempDirs(parentDirs, prefix);
  return parentDirs.map((parent) => mkdtempSync(join(root, parent, prefix)));
}

export function removeTempPaths(paths: readonly string[]): void {
  for (const target of paths) {
    rmSync(target, { recursive: true, force: true });
  }
}

export type BiomeDiagnostic = {
  category: string;
  severity: string;
  message: string;
  location?: {
    path?: string | { file?: string };
  };
};

export type BiomeJsonResult = {
  diagnostics: BiomeDiagnostic[];
};

export function lintText(
  files: string | readonly string[],
  extraFlags: readonly string[] = [],
): string {
  const fileList = typeof files === "string" ? [files] : files;
  const args = [
    ...biomeBinary.prefixArgs,
    "lint",
    `--config-path=${join(root, "biome.json")}`,
    ...extraFlags,
    ...fileList,
  ];
  try {
    return execFileSync(biomeBinary.command, args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const { stdout = "", stderr = "" } = error as {
      stdout?: string;
      stderr?: string;
    };
    return `${stdout}${stderr}`;
  }
}

export function lintJson(
  files: string | readonly string[],
  extraFlags: readonly string[] = [],
): BiomeJsonResult {
  const fileList = typeof files === "string" ? [files] : files;
  const args = [
    ...biomeBinary.prefixArgs,
    "lint",
    `--config-path=${join(root, "biome.json")}`,
    "--reporter=json",
    ...extraFlags,
    ...fileList,
  ];
  try {
    return JSON.parse(
      execFileSync(biomeBinary.command, args, {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    ) as BiomeJsonResult;
  } catch (error) {
    const { stdout } = error as { stdout?: string };
    if (!stdout) throw error;
    return JSON.parse(stdout) as BiomeJsonResult;
  }
}

export function diagnosticsForFile(
  result: BiomeJsonResult,
  filePath: string,
): BiomeDiagnostic[] {
  const expectedSuffix = normalizeBiomePath(filePath).replace(
    `${normalizeBiomePath(root)}/`,
    "",
  );
  return result.diagnostics.filter((diagnostic) => {
    const rawPath = diagnostic.location?.path;
    const reported = typeof rawPath === "string" ? rawPath : rawPath?.file;
    if (!reported) return false;
    const normalizedReported = normalizeBiomePath(reported);
    return (
      normalizedReported === expectedSuffix ||
      normalizedReported.endsWith(`/${expectedSuffix}`)
    );
  });
}
