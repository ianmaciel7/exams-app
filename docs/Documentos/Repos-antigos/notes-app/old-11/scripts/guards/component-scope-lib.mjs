import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

// Application components are every `src/components/<folder>/*.tsx` file outside
// the registry-owned folders. `ui/` holds shadcn/Base UI primitives and
// `firebase/` holds unmodified Firebase UI components; both keep their upstream
// shape. Scope is defined by exclusion so a new domain folder is covered
// without editing any guard.
const COMPONENTS_ROOT = "src/components";
const EXEMPT_COMPONENT_DIRS = new Set(["ui", "firebase"]);
const APPLICATION_COMPONENT_FILE =
  /^src\/components\/([^/]+)\/(?:.+\/)?[^/]+\.tsx$/;

function isApplicationComponentPath(relPath) {
  const normalized = relPath.replaceAll("\\", "/");
  const match = APPLICATION_COMPONENT_FILE.exec(normalized);
  return match !== null && !EXEMPT_COMPONENT_DIRS.has(match[1]);
}

function listApplicationComponentDirs(root) {
  const componentsDir = path.join(root, COMPONENTS_ROOT);
  if (!existsSync(componentsDir)) {
    return [];
  }

  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && !EXEMPT_COMPONENT_DIRS.has(entry.name)
    )
    .map((entry) => path.join(componentsDir, entry.name));
}

function collectTsxFilesRecursively(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsxFilesRecursively(full));
    } else if (entry.name.endsWith(".tsx")) {
      results.push(full);
    }
  }
  return results;
}

// Absolute paths of `*.tsx` files inside each application folder (including subfolders).
// Test and story files are returned too; callers filter them as they need.
function listApplicationComponentFiles(root) {
  return listApplicationComponentDirs(root).flatMap((dir) =>
    collectTsxFilesRecursively(dir)
  );
}

export {
  COMPONENTS_ROOT,
  EXEMPT_COMPONENT_DIRS,
  isApplicationComponentPath,
  listApplicationComponentDirs,
  listApplicationComponentFiles,
};
