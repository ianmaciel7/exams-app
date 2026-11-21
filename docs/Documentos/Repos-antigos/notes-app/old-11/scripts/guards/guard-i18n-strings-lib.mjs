import ts from "typescript";

export function inspectI18nSource(
  sourceText,
  filePath,
  forbiddenPhrases,
  translatedAttributes
) {
  const sf = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const violations = [];
  const add = (node, snippet, reason) =>
    violations.push({
      file: filePath,
      line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
      snippet,
      reason,
    });

  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      for (const regex of forbiddenPhrases) {
        if (regex.test(node.text)) {
          add(
            node,
            node.text,
            `Contains forbidden hardcoded phrase matching ${regex}. Use i18n translation key instead.`
          );
        }
      }
    } else if (ts.isJsxElement(node)) {
      inspectJsxText(node, add);
      inspectJsxAttributes(node.openingElement, add, translatedAttributes);
    } else if (ts.isJsxSelfClosingElement(node)) {
      inspectJsxAttributes(node, add, translatedAttributes);
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return violations;
}

function isSignificantNaturalText(rawText) {
  const text = rawText.trim();
  return (
    Boolean(text) &&
    !/^[0-9\s•\-—/\\|:;,.*+!?()[\]{}<>]+$/.test(text) &&
    /[a-zA-Z]{2,}/.test(text)
  );
}

function inspectJsxText(element, add) {
  const tagName = element.openingElement.tagName.getText();
  for (const child of element.children) {
    if (ts.isJsxText(child) && isSignificantNaturalText(child.getText())) {
      const trimmed = child.getText().trim();
      add(
        child,
        trimmed,
        `Hardcoded text "${trimmed}" inside <${tagName}>. Must use i18n translations (e.g. t(...) or getTranslation(ui, ...)).`
      );
    }
  }
}

function inspectJsxAttributes(openingElement, add, translatedAttributes) {
  const tagName = openingElement.tagName.getText();
  for (const attribute of openingElement.attributes.properties) {
    if (
      !ts.isJsxAttribute(attribute) ||
      !translatedAttributes.has(attribute.name.getText()) ||
      !attribute.initializer ||
      !ts.isStringLiteral(attribute.initializer)
    ) {
      continue;
    }
    const value = attribute.initializer.text;
    if (isSignificantNaturalText(value)) {
      add(
        attribute,
        value,
        `Hardcoded user-facing ${attribute.name.getText()} on <${tagName}>. Must use an i18n translation.`
      );
    }
  }
}
