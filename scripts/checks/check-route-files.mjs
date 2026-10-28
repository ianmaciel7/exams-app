import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const entrypointPattern = /^(page|layout|template)\.[jt]sx?$/;
const permittedNextFunctions = new Set([
  "generateMetadata",
  "generateViewport",
  "generateStaticParams",
]);
const messages = {
  branch:
    "Extract conditional, iterative, and error-handling logic out of route entrypoints.",
  mutation:
    "Extract conditionals and mutations to a focused component or service.",
  state: "Mutable local state belongs in a component, hook, or service.",
  browser: "Browser APIs belong in Client Components.",
  function:
    "Extract helper functions; allow only the default route component and Next.js generators.",
  callback: "Extract inline functions and callbacks into focused modules.",
};

const controlFlowKinds = new Set([
  ts.SyntaxKind.IfStatement,
  ts.SyntaxKind.SwitchStatement,
  ts.SyntaxKind.TryStatement,
  ts.SyntaxKind.ForStatement,
  ts.SyntaxKind.ForOfStatement,
  ts.SyntaxKind.ForInStatement,
  ts.SyntaxKind.WhileStatement,
  ts.SyntaxKind.DoStatement,
  ts.SyntaxKind.ConditionalExpression,
  ts.SyntaxKind.ThrowStatement,
]);

function checkControlFlow(node) {
  if (controlFlowKinds.has(node.kind)) return messages.branch;
}

function checkBinaryLogic(node) {
  if (!ts.isBinaryExpression(node)) return;
  const operator = node.operatorToken.kind;
  if (
    operator === ts.SyntaxKind.AmpersandAmpersandToken ||
    operator === ts.SyntaxKind.BarBarToken ||
    (operator >= ts.SyntaxKind.FirstAssignment &&
      operator <= ts.SyntaxKind.LastAssignment)
  ) {
    return messages.mutation;
  }
}

function checkUpdateExpression(node) {
  if (!ts.isPrefixUnaryExpression(node) && !ts.isPostfixUnaryExpression(node)) {
    return;
  }
  if (
    node.operator === ts.SyntaxKind.PlusPlusToken ||
    node.operator === ts.SyntaxKind.MinusMinusToken
  ) {
    return messages.mutation;
  }
}

function checkMutableDeclaration(node) {
  if (ts.isVariableDeclarationList(node) && node.flags & ts.NodeFlags.Let) {
    return messages.state;
  }
}

function checkBrowserApi(node) {
  if (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    /^(window|document|localStorage|sessionStorage|navigator)$/.test(
      node.expression.text,
    )
  ) {
    return messages.browser;
  }
}

function isAllowedExportedArrow(node) {
  const parent = node.parent;
  if (ts.isExportAssignment(parent) && !parent.isExportEquals) return true;
  if (!ts.isVariableDeclaration(parent) || parent.initializer !== node) {
    return false;
  }
  if (!ts.isIdentifier(parent.name)) return false;
  const statement = parent.parent.parent;
  return (
    ts.isVariableStatement(statement) &&
    statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    ) &&
    permittedNextFunctions.has(parent.name.text)
  );
}

function checkArrowFunction(node) {
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    if (!isAllowedExportedArrow(node)) return messages.callback;
  }
}

function checkNamedFunction(node) {
  if (!ts.isFunctionDeclaration(node)) return;
  const modifiers = node.modifiers ?? [];
  const exported = modifiers.some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
  );
  const isDefault = modifiers.some(
    (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword,
  );
  const isNextFunction =
    exported && permittedNextFunctions.has(node.name?.text);
  if (!isDefault && !isNextFunction) return messages.function;
}

const checks = [
  checkControlFlow,
  checkBinaryLogic,
  checkUpdateExpression,
  checkMutableDeclaration,
  checkBrowserApi,
  checkArrowFunction,
  checkNamedFunction,
];

export function isRouteEntrypoint(path) {
  const normalized = path.replaceAll("\\", "/");
  return (
    normalized.startsWith("src/app/") &&
    entrypointPattern.test(basename(normalized))
  );
}

export function inspectRouteSource(contents, filename) {
  if (!isRouteEntrypoint(filename)) return [];
  const source = ts.createSourceFile(
    filename,
    contents,
    ts.ScriptTarget.Latest,
    true,
    /\.[jt]sx$/.test(filename) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const violations = [];
  const fail = (node, message) => {
    const location = source.getLineAndCharacterOfPosition(
      node.getStart(source),
    );
    violations.push({
      filename,
      line: location.line + 1,
      column: location.character + 1,
      message,
    });
  };

  function visit(node) {
    for (const check of checks) {
      const message = check(node, source);
      if (message) fail(node, message);
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return violations;
}

function listEntrypoints(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listEntrypoints(path);
    return entry.isFile() && entrypointPattern.test(entry.name) ? [path] : [];
  });
}

export function checkRouteEntrypoints(repoRoot) {
  const files = listEntrypoints(join(repoRoot, "src/app"));
  return files.flatMap((file) => {
    const relativePath = relative(repoRoot, file).split(sep).join("/");
    return inspectRouteSource(readFileSync(file, "utf8"), relativePath);
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
  const violations = checkRouteEntrypoints(repoRoot);
  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(
        `${violation.filename}:${violation.line}:${violation.column} ${violation.message}`,
      );
    }
    process.exitCode = 1;
  } else {
    console.log("Route entrypoints: no embedded client or business logic.");
  }
}
