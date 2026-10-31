import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const sourceExtensions = /\.(tsx?|jsx?)$/;
const testFile = /\.(test|spec)\.[jt]sx?$/;
const exceptionNames = new Set(["error", "cause", "err"]);

function sourceFiles(directory, root = directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path, root);
    if (!entry.isFile() || !sourceExtensions.test(path) || testFile.test(path))
      return [];
    return [{ path, relativePath: path.slice(root.length + 1) }];
  });
}

function isExceptionCoercion(node) {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "String" &&
    node.arguments.length === 1 &&
    ts.isIdentifier(node.arguments[0]) &&
    exceptionNames.has(node.arguments[0].text)
  );
}

function containsExceptionCoercion(node) {
  if (isExceptionCoercion(node)) return true;
  let found = false;
  ts.forEachChild(node, (child) => {
    if (!found && containsExceptionCoercion(child)) found = true;
  });
  return found;
}

export function findUnsafeFeedback(sourceText, filename = "source.tsx") {
  const source = ts.createSourceFile(
    filename,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filename.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const violations = [];

  function report(node, sink) {
    const { line } = source.getLineAndCharacterOfPosition(
      node.getStart(source),
    );
    violations.push({ line: line + 1, sink });
  }

  function reportJsx(node) {
    if (node.expression && containsExceptionCoercion(node.expression))
      report(node, "JSX content");
  }

  function reportCall(node) {
    const expression = node.expression;
    if (!ts.isPropertyAccessExpression(expression)) return;
    const hasException = node.arguments.some(containsExceptionCoercion);
    if (!hasException) return;
    if (expression.name.text === "setError") report(node, "form error");
    if (
      expression.name.text === "add" &&
      /toast/i.test(expression.expression.getText(source))
    ) {
      report(node, "toast notification");
    }
  }

  function visit(node) {
    if (ts.isJsxExpression(node)) reportJsx(node);
    if (ts.isCallExpression(node)) reportCall(node);
    ts.forEachChild(node, visit);
  }

  visit(source);
  return violations;
}

export function inspectUiState(root) {
  const sourceRoot = join(root, "src");
  const violations = [];
  for (const { path, relativePath } of sourceFiles(sourceRoot)) {
    const source = readFileSync(path, "utf8");
    for (const violation of findUnsafeFeedback(source, path)) {
      violations.push({ path: relativePath, ...violation });
    }
  }
  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(".");
  const violations = inspectUiState(root);
  if (violations.length > 0) {
    for (const { path, line, sink } of violations) {
      console.error(
        `${path}:${line}: raw exception coercion reaches ${sink}; use a localized, user-safe message`,
      );
    }
    process.exit(1);
  }
  console.log("UI state feedback check passed.");
}
