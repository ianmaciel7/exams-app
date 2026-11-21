import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const responsivePrefixPattern =
  /^(sm|md|lg|xl|2xl|@(?:sm|md|lg|xl|2xl|(?:min-)?\[\d+px\]))$/;

export function hasResponsiveBreakpoint(token) {
  const parts = token.split(":");
  if (parts.length <= 1) return false;
  const prefixes = parts.slice(0, -1);
  return prefixes.some((prefix) => responsivePrefixPattern.test(prefix));
}

export function isOwnedComponent(filename) {
  const path = filename.replaceAll("\\", "/");
  if (!path.endsWith(".tsx") || /\.(test|spec|stories)\.tsx$/.test(path)) {
    return false;
  }
  if (path.startsWith("src/app/")) return path.includes("/_components/");
  if (!path.startsWith("src/components/")) return false;
  if (/^src\/components\/(firebase|ai-elements)\//.test(path)) return false;
  if (path.startsWith("src/components/ui/")) {
    return path.startsWith("src/components/ui/extensions/");
  }
  return true;
}

export function isRouteFile(filename) {
  const path = filename.replaceAll("\\", "/");
  if (!path.startsWith("src/app/")) return false;
  if (/\.(test|spec|stories)\.[jt]sx?$/.test(path)) return false;
  const name = basename(path);
  return /^(layout|page|template|loading|error|not-found)\.[jt]sx?$/.test(name);
}

export function isRootLayout(filename) {
  const normalized = filename.replaceAll("\\", "/");
  return (
    normalized === "src/app/layout.tsx" ||
    normalized.endsWith("/src/app/layout.tsx")
  );
}

function getAttributeString(initializer) {
  if (ts.isStringLiteral(initializer)) return initializer.text;
  if (
    ts.isJsxExpression(initializer) &&
    initializer.expression &&
    ts.isStringLiteral(initializer.expression)
  ) {
    return initializer.expression.text;
  }
  return null;
}

function extractTemplateClassStrings(node) {
  const parts = [node.head.text];
  for (const span of node.templateSpans) {
    parts.push(...extractClassStrings(span.expression), span.literal.text);
  }
  return parts;
}

function extractBranchClassStrings(node) {
  if (ts.isConditionalExpression(node)) {
    return [
      ...extractClassStrings(node.whenTrue),
      ...extractClassStrings(node.whenFalse),
    ];
  }
  if (ts.isBinaryExpression(node)) {
    return [
      ...extractClassStrings(node.left),
      ...extractClassStrings(node.right),
    ];
  }
  return [];
}

function extractClassStrings(node) {
  if (!node) return [];
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return [node.text];
  }
  if (ts.isTemplateExpression(node)) return extractTemplateClassStrings(node);
  if (ts.isJsxExpression(node)) return extractClassStrings(node.expression);
  if (ts.isCallExpression(node))
    return node.arguments.flatMap(extractClassStrings);
  if (ts.isArrayLiteralExpression(node))
    return node.elements.flatMap(extractClassStrings);
  return extractBranchClassStrings(node);
}

function isInteractiveTag(tagName) {
  const lowerTag = tagName.toLowerCase();
  return (
    lowerTag === "button" ||
    lowerTag === "a" ||
    tagName === "Button" ||
    tagName === "Link" ||
    tagName.endsWith("Button") ||
    tagName.endsWith("Action") ||
    tagName.endsWith("Trigger")
  );
}

function isInteractiveAttribute(attr) {
  if (!ts.isJsxAttribute(attr)) return false;
  const name = attr.name.getText();
  if (name === "onClick" || name === "onPress") return true;
  if (name !== "role" || !attr.initializer) return false;
  return ["button", "link", "menuitem"].includes(
    getAttributeString(attr.initializer),
  );
}

function isInteractiveElement(element) {
  return (
    isInteractiveTag(element.tagName.getText()) ||
    element.attributes.properties.some(isInteractiveAttribute)
  );
}

function tinyAxesForToken(token) {
  const base = token.split(":").pop() ?? "";
  const standard = base.match(/^(size|h|w)-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5)$/);
  const pixels = base.match(/^(size|h|w)-\[(\d+(?:\.\d+)?)px\]$/);
  const axis =
    standard?.[1] ?? (pixels && Number(pixels[2]) < 24 ? pixels[1] : null);
  if (axis === "size") return ["h", "w"];
  return axis ? [axis] : [];
}

function isTinyDimension(token) {
  return tinyAxesForToken(token).length > 0;
}

function isHitAreaExpander(token) {
  return (
    token.includes("after:-inset") ||
    token.includes("before:-inset") ||
    token.includes("after:inset") ||
    token.includes("before:inset") ||
    token.includes("after:size-") ||
    token.includes("before:size-")
  );
}

function hasAxisMinimumSize(base, axis) {
  const minimum = base.match(
    /^min-(h|w|size)-(?:([6-9]|[1-9]\d+)|\[(\d+)px\])$/,
  );
  if (!minimum) return false;
  return (
    (minimum[1] === axis || minimum[1] === "size") &&
    (minimum[3] === undefined || Number(minimum[3]) >= 24)
  );
}

function hasAxisPadding(base, axis) {
  const padding = base.match(/^(p|px|py)-(?:([\d.]+)|\[(\d+)px\])$/);
  if (!padding) return false;
  const padPx =
    padding[3] === undefined ? Number(padding[2]) * 4 : Number(padding[3]);
  const matchingAxis =
    padding[1] === "p" ||
    (axis === "h" ? padding[1] === "py" : padding[1] === "px");
  return matchingAxis && padPx >= 6;
}

function isPaddingOrMinSize(base, axis) {
  return hasAxisMinimumSize(base, axis) || hasAxisPadding(base, axis);
}

function hasHitAreaPaddingOrMinSizing(tokens) {
  const tinyAxes = new Set(tokens.flatMap(tinyAxesForToken));
  return [...tinyAxes].every((axis) =>
    tokens.some(
      (token) =>
        isHitAreaExpander(token) ||
        isPaddingOrMinSize(token.split(":").pop() ?? "", axis),
    ),
  );
}

function checkViewportWidth(prop, initText, fail) {
  if (initText !== "device-width") {
    fail(prop, "Viewport width must be 'device-width'.");
  }
}

function checkViewportInitialScale(prop, initText, fail) {
  if (initText !== "1") {
    fail(prop, "Viewport initialScale must be 1.");
  }
}

function hasDisabledZoomValue(propName, value) {
  return propName === "userScalable" && ["false", "no", "0"].includes(value);
}

function checkMaximumScaleRestriction(prop, value, fail) {
  const number = Number(value);
  if (!Number.isNaN(number) && number <= 1) {
    fail(
      prop,
      "Restricting maximumScale to 1 is strictly forbidden; users must be allowed to zoom (WCAG 1.4.4).",
    );
  }
}

function checkViewportZoomRestrictions(prop, propName, init, initText, fail) {
  if (hasDisabledZoomValue(propName, initText)) {
    fail(
      prop,
      "Disabling user zoom (userScalable: false) is strictly forbidden for accessibility (WCAG 1.4.4).",
    );
  }
  if (propName === "maximumScale")
    checkMaximumScaleRestriction(prop, initText, fail);
  if (ts.isStringLiteral(init) && /user-scalable\s*=\s*no/i.test(init.text)) {
    fail(
      prop,
      "Disabling user zoom ('user-scalable=no') is strictly forbidden for accessibility (WCAG 1.4.4).",
    );
  }
}

function inspectViewportProperties(objLiteral, fail) {
  let hasWidth = false;
  let hasInitialScale = false;

  for (const prop of objLiteral.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const propName = prop.name.getText().replace(/['"]/g, "");
    const init = prop.initializer;
    const initText = init.getText().replace(/['"]/g, "");

    if (propName === "width") {
      hasWidth = true;
      checkViewportWidth(prop, initText, fail);
    } else if (propName === "initialScale") {
      hasInitialScale = true;
      checkViewportInitialScale(prop, initText, fail);
    } else {
      checkViewportZoomRestrictions(prop, propName, init, initText, fail);
    }
  }

  if (!hasWidth) {
    fail(objLiteral, "Exported viewport must declare width: 'device-width'.");
  }
  if (!hasInitialScale) {
    fail(objLiteral, "Exported viewport must declare initialScale: 1.");
  }
}

function parseMetaAttributes(element) {
  let isViewportMeta = false;
  let contentValue = "";
  let contentNode = element;

  for (const attr of element.attributes.properties) {
    if (!ts.isJsxAttribute(attr) || !attr.initializer) continue;
    const name = attr.name.getText();
    if (name === "name") {
      const val = getAttributeString(attr.initializer);
      if (val === "viewport") isViewportMeta = true;
    } else if (name === "content") {
      contentValue = getAttributeString(attr.initializer) ?? "";
      contentNode = attr;
    }
  }

  return { isViewportMeta, contentValue, contentNode };
}

function validateMetaViewportContent(contentValue, contentNode, fail) {
  if (/user-scalable\s*=\s*no/i.test(contentValue)) {
    fail(
      contentNode,
      "Disabling user zoom ('user-scalable=no') is strictly forbidden for accessibility (WCAG 1.4.4).",
    );
  }
  if (/maximum-scale\s*=\s*1(\.0)?(\b|,|$)/i.test(contentValue)) {
    fail(
      contentNode,
      "Restricting maximumScale to 1 is strictly forbidden; users must be allowed to zoom (WCAG 1.4.4).",
    );
  }
  if (!/width\s*=\s*device-width/i.test(contentValue)) {
    fail(contentNode, "Viewport meta tag must include 'width=device-width'.");
  }
  if (!/initial-scale\s*=\s*1(\.0)?(\b|,|$)/i.test(contentValue)) {
    fail(contentNode, "Viewport meta tag must include 'initial-scale=1'.");
  }
}

function checkJsxMetaElement(element, fail) {
  if (element.tagName.getText() !== "meta") return;
  const { isViewportMeta, contentValue, contentNode } =
    parseMetaAttributes(element);
  if (!isViewportMeta) return;
  validateMetaViewportContent(contentValue, contentNode, fail);
}

function parseInlineStyleWidths(objLiteral) {
  let widthVal = 0;
  let hasFluidMaxWidth = false;

  for (const prop of objLiteral.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const name = prop.name.getText().replace(/['"]/g, "");
    const valText = prop.initializer.getText().replace(/['"]/g, "");

    if (name === "width" || name === "minWidth") {
      const pxMatch = valText.match(/^(\d+(?:\.\d+)?)(?:px)?$/);
      if (pxMatch) {
        widthVal = Math.max(widthVal, Number.parseFloat(pxMatch[1]));
      }
    } else if (name === "maxWidth") {
      if (/^(100%|100vw|min\(100%)/.test(valText)) {
        hasFluidMaxWidth = true;
      }
    }
  }

  return { widthVal, hasFluidMaxWidth };
}

function checkInlineStyleObject(objLiteral, styleAttr, fail) {
  const { widthVal, hasFluidMaxWidth } = parseInlineStyleWidths(objLiteral);
  if (widthVal > 320 && !hasFluidMaxWidth) {
    fail(
      styleAttr,
      `Rigid non-responsive inline style width (${widthVal}px) exceeds 320px without fluid constraints.`,
    );
  }
}

function checkRigidTokens(tokens, anchorNode, fail) {
  const hasFluidWrapper = tokens.some((t) =>
    /^(max-w-full|max-w-screen|max-w-\[100%\]|max-w-\[100vw\])$/.test(t),
  );

  for (const token of tokens) {
    const rigidMatch = token.match(
      /^(?:([a-z0-9_@:-]+):)?(min-w|w)-\[(\d+)px\]$/,
    );
    if (!rigidMatch) continue;

    const prefix = rigidMatch[1] ?? "";
    const px = Number.parseInt(rigidMatch[3], 10);
    if (px > 320) {
      const hasResponsive = prefix && hasResponsiveBreakpoint(token);
      if (!hasResponsive && !hasFluidWrapper) {
        fail(
          anchorNode,
          `Rigid non-responsive width '${token}' exceeds 320px without responsive breakpoint prefix (e.g., 'sm:', 'md:') or fluid wrapper (e.g., 'max-w-full').`,
        );
      }
    }
  }
}

function checkElementTouchTarget(tokens, anchorNode, element, fail) {
  if (!element || !isInteractiveElement(element)) return;

  const tinyToken = tokens.find(isTinyDimension);
  if (tinyToken && !hasHitAreaPaddingOrMinSizing(tokens)) {
    fail(
      anchorNode,
      `Interactive element <${element.tagName.getText()}> has tiny dimension '${tinyToken}' violating WCAG 2.2 SC 2.5.8 Touch Target (min 24x24px) without hit-area padding or minimum sizing.`,
    );
  }
}

function checkClassTokens(tokens, anchorNode, element, fail) {
  checkRigidTokens(tokens, anchorNode, fail);
  checkElementTouchTarget(tokens, anchorNode, element, fail);
}

function unwrapObjectLiteral(node) {
  if (!node) return null;
  if (ts.isObjectLiteralExpression(node)) return node;
  if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
    return unwrapObjectLiteral(node.expression);
  }
  if (ts.isParenthesizedExpression(node)) {
    return unwrapObjectLiteral(node.expression);
  }
  return null;
}

function checkViewportVariable(node, state, fail) {
  if (!ts.isVariableStatement(node)) return;
  const isExported = node.modifiers?.some(
    (m) => m.kind === ts.SyntaxKind.ExportKeyword,
  );
  if (!isExported) return;

  for (const decl of node.declarationList.declarations) {
    if (decl.name.getText() === "viewport" && decl.initializer) {
      state.hasViewportExport = true;
      const obj = unwrapObjectLiteral(decl.initializer);
      if (obj) inspectViewportProperties(obj, fail);
    }
  }
}

function checkViewportFunction(node, state, fail) {
  if (!ts.isFunctionDeclaration(node)) return;
  const isExported = node.modifiers?.some(
    (m) => m.kind === ts.SyntaxKind.ExportKeyword,
  );
  if (!isExported || node.name?.getText() !== "generateViewport") return;

  state.hasViewportExport = true;
  node.body?.forEachChild((stmt) => {
    if (ts.isReturnStatement(stmt) && stmt.expression) {
      const obj = unwrapObjectLiteral(stmt.expression);
      if (obj) inspectViewportProperties(obj, fail);
    }
  });
}

function checkJsxClassName(node, fail) {
  const classAttr = node.attributes.properties.find(
    (attr) => ts.isJsxAttribute(attr) && attr.name.getText() === "className",
  );
  if (!classAttr || !ts.isJsxAttribute(classAttr) || !classAttr.initializer)
    return;
  const classStrings = extractClassStrings(classAttr.initializer);
  const tokens = classStrings
    .flatMap((value) => value.split(/\s+/))
    .filter(Boolean);
  checkClassTokens(tokens, classAttr, node, fail);
}

function checkJsxInlineStyle(node, fail) {
  const styleAttr = node.attributes.properties.find(
    (attr) => ts.isJsxAttribute(attr) && attr.name.getText() === "style",
  );
  if (!styleAttr || !ts.isJsxAttribute(styleAttr)) return;
  if (!styleAttr.initializer || !ts.isJsxExpression(styleAttr.initializer))
    return;
  const expression = styleAttr.initializer.expression;
  if (expression && ts.isObjectLiteralExpression(expression)) {
    checkInlineStyleObject(expression, styleAttr, fail);
  }
}

function checkJsxElement(node, fail) {
  if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node))
    return;
  checkJsxMetaElement(node, fail);
  checkJsxClassName(node, fail);
  checkJsxInlineStyle(node, fail);
}

function checkClassLiteralConstant(node, fail) {
  if (
    (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) ||
    ts.isJsxAttribute(node.parent)
  ) {
    return;
  }
  if (/(?:min-w|w)-\[\d+px\]/.test(node.text)) {
    const tokens = node.text.split(/\s+/).filter(Boolean);
    checkClassTokens(tokens, node, null, fail);
  }
}

export function inspectResponsivenessSource(contents, filename) {
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

  const state = { hasViewportExport: false };

  function visit(node) {
    checkViewportVariable(node, state, fail);
    checkViewportFunction(node, state, fail);
    checkJsxElement(node, fail);
    checkClassLiteralConstant(node, fail);
    ts.forEachChild(node, visit);
  }

  visit(source);

  if (isRootLayout(filename) && !state.hasViewportExport) {
    violations.unshift({
      filename,
      line: 1,
      column: 1,
      message:
        "Root layout must export a viewport configuration with width: 'device-width' and initialScale: 1.",
    });
  }

  return violations;
}

function listAllFiles(directory) {
  try {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".next" ||
          entry.name === ".git"
        ) {
          return [];
        }
        return listAllFiles(fullPath);
      }
      return entry.isFile() ? [fullPath] : [];
    });
  } catch {
    return [];
  }
}

export function runResponsivenessCheck(repoRoot = process.cwd()) {
  const appDir = join(repoRoot, "src/app");
  const componentsDir = join(repoRoot, "src/components");

  const files = [...listAllFiles(appDir), ...listAllFiles(componentsDir)];

  const violations = [];

  for (const file of files) {
    const rel = relative(repoRoot, file).split(sep).join("/");
    const isTarget = isRouteFile(rel) || isOwnedComponent(rel);
    if (!isTarget) continue;

    const contents = readFileSync(file, "utf8");
    const fileViolations = inspectResponsivenessSource(contents, rel);
    violations.push(...fileViolations);
  }

  return violations;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
  const violations = runResponsivenessCheck(repoRoot);
  if (violations.length > 0) {
    for (const v of violations) {
      console.error(`${v.filename}:${v.line}:${v.column} ${v.message}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      "Responsiveness checks passed: viewports, responsive widths, and touch targets are valid.",
    );
  }
}
