import { globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// `src/components` holds only presentational building blocks written in the
// shadcn/Base UI style: the `ui` registry (including `ui/extensions`) and the
// `ai-elements` registry, plus the owned `firebase` tree. The `firebase` tree
// is the one place where `-client` wrappers (hook plus presentation) may live,
// because it is scoped to a single SDK. Other integration components, the ones
// that read the session, headers or the request, belong next to the route that
// owns them in a private `_components` folder (Next.js project organization),
// shared ones in the nearest common `_components` folder. This is a rule on
// the directory, not a list of files: any new file is judged by its path,
// name and boundary directives.

const root = "src/components";
const componentTrees = new Set(["ui", "ai-elements", "firebase"]);
// Trees that own the integration of one SDK may hold `-client` wrappers.
const clientWrapperTrees = new Set(["firebase"]);
const integrationStem = /-(?:client|server)$/;
const serverBoundary =
  /^\s*(?:["']use server["']|import\s+["']server-only["']|import\s+["']client-only["'])/m;

/** `sources` maps repository-relative POSIX paths to file text. */
export function inspectComponentsDirectory(sources) {
  const errors = [];
  for (const [file, text] of Object.entries(sources)) {
    if (!file.startsWith(`${root}/`)) continue;
    const [, , registry, ...rest] = file.split("/");
    if (!componentTrees.has(registry) || rest.length === 0) {
      errors.push(
        `${file}: ${root} only holds the ${[...componentTrees].join(" and ")} component trees; move integration components to the _components folder of the route that owns them (src/app/**/_components).`,
      );
      continue;
    }
    const stem = file
      .split("/")
      .at(-1)
      .replace(/(?:\.(?:test|spec|stories|browser\.test))?\.[cm]?[jt]sx?$/, "");
    const isIntegration = clientWrapperTrees.has(registry)
      ? /-server$/.test(stem)
      : integrationStem.test(stem);
    if (isIntegration) {
      errors.push(
        `${file}: ${root} has no ${clientWrapperTrees.has(registry) ? "-server" : "-client or -server"} components; those are integrations and belong in src/app/**/_components.`,
      );
    }
    if (serverBoundary.test(text)) {
      errors.push(
        `${file}: ${root} cannot declare "use server", server-only or client-only; keep the boundary in src/app/**/_components.`,
      );
    }
  }
  return errors;
}

export function checkComponentsDirectory(base) {
  const sources = {};
  for (const file of globSync(`${root}/**/*`, { cwd: base })) {
    const path = file.replaceAll("\\", "/");
    if (!/\.[cm]?[jt]sx?$/.test(path)) continue;
    sources[path] = readFileSync(resolve(base, file), "utf8");
  }
  return inspectComponentsDirectory(sources);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkComponentsDirectory(
    fileURLToPath(new URL("../../", import.meta.url)),
  );
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log(
    "src/components holds only the ui, ai-elements and firebase component trees.",
  );
}
