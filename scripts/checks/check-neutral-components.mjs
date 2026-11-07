import { globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// A component that needs nothing from the browser is a normal component: it
// must stay neutral, so a Server Component and a Client Component can both
// render it (React docs, "use client"; Next.js, "Server and Client
// Components"). The directive turns a module into a client entry point, so it
// is only allowed when the module itself needs the client: a Hook, a context,
// an event handler or a browser global. Judged by the syntax tree, not by a
// list of files.

const directive = /^\s*(?:\/\/.*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/;
const testFile = /\.(?:test|spec|stories|browser\.test)\.[cm]?[jt]sx?$/;
const hookName = /^use[A-Z0-9]/;
const clientApis = new Set([
  "createContext",
  "createRef",
  "flushSync",
  "startTransition",
]);
const browserGlobals = new Set([
  "window",
  "document",
  "navigator",
  "localStorage",
  "sessionStorage",
  "location",
  "history",
  "matchMedia",
  "requestAnimationFrame",
  "IntersectionObserver",
  "ResizeObserver",
  "MutationObserver",
  "URL.createObjectURL",
]);
const handlerProp = /^on[A-Z]/;

function calleeName(node) {
  const { expression } = node;
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  return "";
}

function clientReason(node) {
  if (ts.isCallExpression(node)) {
    const name = calleeName(node);
    if (hookName.test(name) || clientApis.has(name)) return `calls ${name}`;
  }
  if (ts.isJsxAttribute(node) && handlerProp.test(node.name.getText())) {
    return `sets the ${node.name.getText()} handler`;
  }
  if (ts.isIdentifier(node) && browserGlobals.has(node.text)) {
    const p = node.parent;
    const isMember = ts.isPropertyAccessExpression(p) && p.name === node;
    if (!isMember) return `uses ${node.text}`;
  }
  if (ts.isClassDeclaration(node) && node.heritageClauses?.length) {
    return "declares a class component";
  }
  if (
    ts.isImportDeclaration(node) &&
    ts.isStringLiteral(node.moduleSpecifier) &&
    node.moduleSpecifier.text === "client-only"
  ) {
    return "imports client-only";
  }
  return null;
}

/** Returns why the module needs the client, or null when it is neutral. */
export function findClientReason(code, fileName = "module.tsx") {
  const source = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let reason = null;
  const visit = (node) => {
    if (reason) return;
    reason = clientReason(node);
    if (!reason) ts.forEachChild(node, visit);
  };
  visit(source);
  return reason;
}

/** `sources` maps repository-relative POSIX paths to file text. */
export function inspectNeutralComponents(sources) {
  const problems = [];
  for (const [file, code] of Object.entries(sources)) {
    if (testFile.test(file) || !/\.tsx$/.test(file)) continue;
    if (!directive.test(code)) continue;
    if (findClientReason(code, file)) continue;
    problems.push(
      `${file}: "use client" on a module that needs nothing from the browser (no Hook, context, event handler or browser global). Remove it so Server and Client Components can both render it.`,
    );
  }
  return problems;
}

export function checkNeutralComponents(base) {
  const sources = {};
  for (const file of globSync("src/**/*.tsx", { cwd: base })) {
    const path = file.replaceAll("\\", "/");
    sources[path] = readFileSync(resolve(base, file), "utf8");
  }
  return inspectNeutralComponents(sources);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkNeutralComponents(
    resolve(fileURLToPath(import.meta.url), "../../.."),
  );
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("Every component without client needs stays neutral.");
}
