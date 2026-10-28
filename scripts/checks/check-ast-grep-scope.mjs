import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ast-grep globs let `*` cross `/`, so `src/components/ui/*.tsx` in `ignores`
// also skips `src/components/ui/extensions/**`, where our own components live.
// Until 2026-10-31 that silently exempted every owned component from 22 rules.
export const BAD_IGNORE = "src/components/ui/*.tsx";

export function findBadIgnores(rulesDir = ".ast-grep/rules") {
  const found = [];
  for (const entry of readdirSync(rulesDir, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile() || !entry.name.endsWith(".yml")) continue;
    const file = join(entry.parentPath, entry.name);
    const lines = readFileSync(file, "utf8").split("\n");
    if (
      lines.some(
        (line) => line.replace(/^\s*-\s*["']?|["']?\s*$/g, "") === BAD_IGNORE,
      )
    ) {
      found.push(file);
    }
  }
  return found;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bad = findBadIgnores();
  if (bad.length > 0) {
    console.error(
      `ast-grep rules ignore ${BAD_IGNORE}, which also skips src/components/ui/extensions. Use "src/components/ui/[!e]*.tsx" and "src/components/ui/e[!x]*.tsx":\n${bad.join("\n")}`,
    );
    process.exit(1);
  }
}
