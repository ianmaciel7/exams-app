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

const DEFAULT_EXPORT = "Route Handlers must not have a default export.";
const STAR_EXPORT = "Route Handlers must not re-export with `export *`.";

function isDefaultExport(node) {
  return ts
    .getModifiers(node)
    ?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
}

function isDirective(node) {
  return ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression);
}

function notAllowed(node, name) {
  return {
    node,
    message: `"${name}" is not a Route Handler export; export only HTTP methods (GET, POST, ...) and route segment config, and move everything else to src/lib.`,
  };
}

function exportDeclarationProblems(node) {
  if (!node.exportClause || ts.isNamespaceExport(node.exportClause)) {
    return [{ node, message: STAR_EXPORT }];
  }
  return node.exportClause.elements
    .filter((specifier) => !allowed.has(specifier.name.text))
    .map((specifier) => notAllowed(specifier, specifier.name.text));
}

function exportedProblems(node) {
  if (isDefaultExport(node)) return [{ node, message: DEFAULT_EXPORT }];
  return declaredNames(node)
    .filter((name) => !allowed.has(name))
    .map((name) => notAllowed(node, name));
}

function helperProblems(node) {
  const [name = "declaration"] = declaredNames(node);
  return [
    {
      node,
      message: `Helper "${name}" must not be declared in a Route Handler; move it to src/lib and import it.`,
    },
  ];
}

function statementProblems(node) {
  if (ts.isImportDeclaration(node) || isDirective(node)) return [];
  if (ts.isExportAssignment(node)) {
    return [{ node, message: DEFAULT_EXPORT }];
  }
  if (ts.isExportDeclaration(node)) return exportDeclarationProblems(node);
  return exported(node) ? exportedProblems(node) : helperProblems(node);
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
  return source.statements
    .flatMap(statementProblems)
    .map(({ node, message }) => ({
      line:
        source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      message,
    }));
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
