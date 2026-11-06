import { globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Next.js Route Handlers (`route.ts`) support exactly these exports: the HTTP
// method handlers and the route segment config options. Anything else is
// rejected by Next.js, and helpers, constants and types declared in the file
// belong in `src/lib`. The contract is read from the syntax tree, so it holds
// for every `route.{ts,js}` under `src/app` without a list of files.
// https://nextjs.org/docs/app/api-reference/file-conventions/route
export const handlerExports = new Set([
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
]);
export const segmentConfigExports = new Set([
  "dynamic",
  "dynamicParams",
  "revalidate",
  "fetchCache",
  "runtime",
  "preferredRegion",
  "maxDuration",
  "generateStaticParams",
]);
const allowed = new Set([...handlerExports, ...segmentConfigExports]);
const routePattern = /(?:^|\/)src\/app\/(?:.*\/)?route\.[cm]?[jt]s$/;

export function isRouteHandler(path) {
  return routePattern.test(path.replaceAll("\\", "/"));
}

function exported(node) {
  return ts
    .getModifiers(node)
    ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

function declaredNames(node) {
  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations.map((d) => d.name.getText());
  }
  return node.name ? [node.name.text] : [];
}

/** Returns `{ line, message }` for each statement outside the route contract. */
export function inspectRouteHandler(contents, filename = "route.ts") {
  const source = ts.createSourceFile(
    filename,
    contents,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const problems = [];
  const report = (node, message) =>
    problems.push({
      line:
        source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      message,
    });
  const notAllowed = (node, name) =>
    report(
      node,
      `"${name}" is not a Route Handler export; export only HTTP methods (GET, POST, ...) and route segment config, and move everything else to src/lib.`,
    );

  for (const node of source.statements) {
    if (ts.isImportDeclaration(node)) continue;
    if (ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression))
      continue;
    if (ts.isExportAssignment(node)) {
      report(node, "Route Handlers must not have a default export.");
    } else if (ts.isExportDeclaration(node)) {
      if (!node.exportClause || ts.isNamespaceExport(node.exportClause)) {
        report(node, "Route Handlers must not re-export with `export *`.");
        continue;
      }
      for (const specifier of node.exportClause.elements) {
        if (!allowed.has(specifier.name.text))
          notAllowed(specifier, specifier.name.text);
      }
    } else if (exported(node)) {
      if (
        ts
          .getModifiers(node)
          ?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
      ) {
        report(node, "Route Handlers must not have a default export.");
        continue;
      }
      for (const name of declaredNames(node)) {
        if (!allowed.has(name)) notAllowed(node, name);
      }
    } else {
      const [name = "declaration"] = declaredNames(node);
      report(
        node,
        `Helper "${name}" must not be declared in a Route Handler; move it to src/lib and import it.`,
      );
    }
  }
  return problems;
}

export function checkRouteHandlers(root) {
  return globSync("src/app/**/route.{ts,js,mts,mjs,cts,cjs}", {
    cwd: root,
  }).flatMap((file) => {
    const path = file.replaceAll("\\", "/");
    return inspectRouteHandler(
      readFileSync(resolve(root, file), "utf8"),
      path,
    ).map(({ line, message }) => `${path}:${line} ${message}`);
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkRouteHandlers(
    fileURLToPath(new URL("../../", import.meta.url)),
  );
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
  } else {
    console.log("Route Handlers: only HTTP methods and segment config.");
  }
}
