import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { isOwnedComponent } from "./check-component-conventions.mjs";

// shadcn/ui native component structure, enforced on owned components. Every
// component typed `ComponentProps<"tag">` must be written the way the shadcn
// registry writes its own: the root is that tag, it carries a `data-slot`,
// `className` goes through `cn(..., className)` and the remaining props are
// spread once. Polymorphic components use Base UI `useRender` + `mergeProps`
// (the `render` prop), never `asChild`, `Slot` or `cloneElement`.

const componentPropsName = /^(React\.)?ComponentProps$/;

function localAlias(source, name) {
  return source.statements.find(
    (statement) =>
      ts.isTypeAliasDeclaration(statement) && statement.name.text === name,
  )?.type;
}

/** The intrinsic tag named by `ComponentProps<"tag">`, through aliases. */
export function inheritedTag(type, source, seen = new Set()) {
  if (!type || seen.has(type)) return undefined;
  seen.add(type);
  if (ts.isParenthesizedTypeNode(type)) {
    return inheritedTag(type.type, source, seen);
  }
  if (ts.isIntersectionTypeNode(type)) {
    return type.types
      .map((part) => inheritedTag(part, source, seen))
      .find(Boolean);
  }
  if (!ts.isTypeReferenceNode(type)) return undefined;
  const name = type.typeName.getText(source);
  const argument = type.typeArguments?.[0];
  if (componentPropsName.test(name)) {
    return argument &&
      ts.isLiteralTypeNode(argument) &&
      ts.isStringLiteral(argument.literal)
      ? argument.literal.text
      : undefined;
  }
  if (name === "Omit") return inheritedTag(argument, source, seen);
  return inheritedTag(localAlias(source, name), source, seen);
}

function returnRoot(statement) {
  let expression = statement.expression;
  while (expression && ts.isParenthesizedExpression(expression)) {
    expression = expression.expression;
  }
  if (expression && ts.isJsxElement(expression))
    return expression.openingElement;
  if (expression && ts.isJsxSelfClosingElement(expression)) return expression;
  return undefined;
}

function components(source) {
  const found = [];
  for (const statement of source.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      /^[A-Z]/.test(statement.name.text) &&
      statement.body
    ) {
      found.push(statement);
    }
  }
  return found;
}

function attribute(opening, name) {
  return opening.attributes.properties.find(
    (candidate) =>
      ts.isJsxAttribute(candidate) && candidate.name.getText() === name,
  );
}

function spreads(opening, name) {
  return opening.attributes.properties.filter(
    (candidate) =>
      ts.isJsxSpreadAttribute(candidate) &&
      ts.isIdentifier(candidate.expression) &&
      candidate.expression.text === name,
  );
}

function restName(parameter) {
  if (!ts.isObjectBindingPattern(parameter.name))
    return parameter.name.getText();
  return parameter.name.elements
    .find((element) => element.dotDotDotToken)
    ?.name.getText();
}

function destructures(parameter, property) {
  return (
    ts.isObjectBindingPattern(parameter.name) &&
    parameter.name.elements.some(
      (element) =>
        !element.dotDotDotToken &&
        (element.propertyName?.getText() ?? element.name.getText()) ===
          property,
    )
  );
}

function usesCn(initializer, bindingName) {
  const expression =
    initializer && ts.isJsxExpression(initializer)
      ? initializer.expression
      : undefined;
  if (!expression || !ts.isCallExpression(expression)) return false;
  if (expression.expression.getText() !== "cn") return false;
  const last = expression.arguments.at(-1);
  return !!last && ts.isIdentifier(last) && last.text === bindingName;
}

function checkRootProps(root, parameter, report) {
  const rest = restName(parameter);
  if (!rest) {
    report(
      root,
      "Capture and spread the remaining props onto the root exactly once.",
    );
  } else {
    const count = spreads(root, rest).length;
    if (count !== 1) {
      report(
        root,
        `Spread the remaining props (...${rest}) onto the root exactly once; found ${count}.`,
      );
    }
  }
  if (destructures(parameter, "className")) {
    const binding = parameter.name.elements.find(
      (element) =>
        !element.dotDotDotToken &&
        (element.propertyName?.getText() ?? element.name.getText()) ===
          "className",
    );
    const className = attribute(root, "className");
    if (!className || !usesCn(className.initializer, binding.name.getText())) {
      report(
        root,
        'Merge className with cn("...", className) as the last argument.',
      );
    }
  }
}

function inspectRoot(declaration, source, tag, report) {
  const parameter = declaration.parameters[0];
  const roots = declaration.body.statements
    .filter(ts.isReturnStatement)
    .map(returnRoot)
    .filter(Boolean);
  for (const root of roots) {
    const rootTag = root.tagName.getText(source);
    // A component root (adapter or composition) is covered by the primitive
    // adapter checks in check-component-composition.mjs.
    if (/^[A-Z]/.test(rootTag)) continue;
    if (rootTag !== tag) {
      report(
        root,
        `Typed ComponentProps<"${tag}"> but renders <${rootTag}>; the root must be the tag the props describe.`,
      );
    }
    if (!attribute(root, "data-slot")) {
      report(
        root,
        `${declaration.name.text} must set data-slot on its root, like every shadcn component.`,
      );
    }
    checkRootProps(root, parameter, report);
  }
}

export function inspectComponentStructure(content, filename) {
  if (!isOwnedComponent(filename)) return [];
  const source = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const issues = [];
  const report = (node, message) => {
    const { line, character } = source.getLineAndCharacterOfPosition(
      node.getStart(source),
    );
    issues.push({
      file: filename,
      line: line + 1,
      column: character + 1,
      message,
    });
  };
  for (const declaration of components(source)) {
    const parameter = declaration.parameters[0];
    if (!parameter) continue;
    const tag = inheritedTag(parameter.type, source);
    if (tag) inspectRoot(declaration, source, tag, report);
  }
  inspectPolymorphism(source, report);
  return issues;
}

function inspectPolymorphism(source, report) {
  const imports = new Set();
  for (const statement of source.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text.startsWith("@base-ui/react/")
    ) {
      imports.add(statement.moduleSpecifier.text.split("/").at(-1));
    }
  }
  if (imports.has("use-render") && !imports.has("merge-props")) {
    report(
      source,
      "useRender components must merge their props with mergeProps (@base-ui/react/merge-props).",
    );
  }
}

export function checkComponentStructure(root) {
  const base = join(root, "src");
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else files.push(path);
    }
  };
  walk(base);
  return files.flatMap((file) => {
    const path = relative(root, file).split(sep).join("/");
    if (!isOwnedComponent(path)) return [];
    return inspectComponentStructure(readFileSync(file, "utf8"), path);
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const findings = checkComponentStructure(
    fileURLToPath(new URL("../../", import.meta.url)),
  );
  for (const issue of findings) {
    console.error(
      `${issue.file}:${issue.line}:${issue.column} ${issue.message}`,
    );
  }
  if (findings.length) process.exitCode = 1;
  else console.log("Component structure: all owned files passed.");
}
