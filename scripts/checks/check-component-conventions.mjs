import { readdirSync, readFileSync } from "node:fs";
import { isBuiltin } from "node:module";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { checkComponentComposition } from "./check-component-composition.mjs";

const kebabCase = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const environmentSuffix = /-(component|ui|presentation)$/;
const screenStem = /(^|-)(screen|view|page)$/;
const semanticStem = (stem) => stem.replace(/-(client|server)$/, "");
const serverImports =
  /^(next\/(headers|cache|server)|next-intl\/server|server-only|firebase-admin)(\/|$)/;
const uiPhaseStatuses = new Set(["loading", "hidden", "error", "ready"]);

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

function pascalCase(name) {
  return name
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function exported(statement) {
  return statement.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
  );
}

function namedExports(statement) {
  if (
    !ts.isExportDeclaration(statement) ||
    statement.isTypeOnly ||
    !statement.exportClause ||
    !ts.isNamedExports(statement.exportClause)
  )
    return [];
  return statement.exportClause.elements
    .filter((specifier) => !specifier.isTypeOnly)
    .map((specifier) => specifier.name.text)
    .filter((name) => /^[A-Z]/.test(name));
}

function exportedFunctionNames(statement) {
  if (
    !ts.isFunctionDeclaration(statement) ||
    !exported(statement) ||
    !statement.name
  )
    return [];
  const name = statement.name.text;
  return /^[A-Z]/.test(name) ? [name] : [];
}

function exportedVariableNames(statement) {
  if (!ts.isVariableStatement(statement) || !exported(statement)) return [];
  return statement.declarationList.declarations
    .filter((declaration) => ts.isIdentifier(declaration.name))
    .map((declaration) => declaration.name.text)
    .filter((name) => /^[A-Z]/.test(name));
}

function componentExports(source) {
  return source.statements.flatMap((statement) => [
    ...namedExports(statement),
    ...exportedFunctionNames(statement),
    ...exportedVariableNames(statement),
  ]);
}

function checkFileName(source, stem, report) {
  if (!kebabCase.test(stem)) {
    report(source, "Component filename must be kebab-case.");
  }
  const semantic = semanticStem(stem);
  if (environmentSuffix.test(stem) || environmentSuffix.test(semantic)) {
    report(
      source,
      "Name by semantic role, never by Component/UI/Presentation.",
    );
  }
  if (screenStem.test(semantic)) {
    report(
      source,
      `Component name "${stem}" must not end with a screen or page term (-screen, -view, -page); name by semantic role such as -section, -card, -form, -flow, or -hero.`,
    );
  }
}

const profileCardParts = [
  "ProfileCard",
  "ProfileCardHeader",
  "ProfileCardAction",
  "ProfileCardTitle",
  "ProfileCardDescription",
  "ProfileCardContent",
  "ProfileCardFooter",
];

const profileFormParts = ["ProfileFormClient"];

function tokenizeKebab(stem) {
  return stem.toLowerCase().split("-").filter(Boolean);
}

function tokenizePascal(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .split("-")
    .filter(Boolean);
}

function termParityMessage(name, fileStem, fileTerms) {
  const compTerms = tokenizePascal(name);
  const missing = fileTerms.filter((term) => !compTerms.includes(term));
  const extra = compTerms.filter((term) => !fileTerms.includes(term));
  if (!missing.length && !extra.length) return null;

  const missingMsg = missing.length
    ? `missing term(s): ${missing.map((t) => `"${t}"`).join(", ")}; `
    : "";
  const extraMsg = extra.length
    ? `unexpected term(s): ${extra.map((t) => `"${t}"`).join(", ")}; `
    : "";

  return (
    `Component "${name}" does not match filename stem "${fileStem}": ` +
    missingMsg +
    extraMsg +
    "component and filename must match term-for-term."
  );
}

function checkStemComponentTermParity(source, fileStem, report) {
  const fileTerms = tokenizeKebab(fileStem);
  const expectedRoot = pascalCase(fileStem);

  for (const statement of source.statements) {
    if (!ts.isFunctionDeclaration(statement) || !statement.name) continue;
    const name = statement.name.text;
    if (!/^[A-Z]/.test(name) || name.startsWith(expectedRoot)) continue;

    const message = termParityMessage(name, fileStem, fileTerms);
    if (message) report(statement, message);
  }
}

function expectedComponentNames(source, _stem) {
  const path = source.fileName.replaceAll("\\", "/");
  if (path.endsWith("/profile/_components/profile-card.tsx")) {
    return profileCardParts;
  }
  if (path.endsWith("/profile/_components/profile-form-client.tsx")) {
    return profileFormParts;
  }
  if (path.endsWith("/profile/_components/profile-form.tsx")) {
    return ["ProfileForm", "ProfileFormContent", "ProfileFormFooter"];
  }
  const fileStem = basename(source.fileName.replaceAll("\\", "/"), ".tsx");
  const root = pascalCase(fileStem);
  const parts = componentExports(source).filter(
    (name) => name.startsWith(root) && /^[A-Z]/.test(name.slice(root.length)),
  );
  return [root, ...parts];
}

function checkPrimaryExport(source, stem, report) {
  const expected = expectedComponentNames(source, stem);
  for (const name of expected) {
    const isLocalFunction = source.statements.some(
      (statement) =>
        ts.isFunctionDeclaration(statement) &&
        statement.name?.text === name &&
        !exported(statement),
    );
    if (!isLocalFunction) {
      report(source, `Declare ${name} as a local named function.`);
    }
  }
  const names = componentExports(source);
  if (
    names.length !== expected.length ||
    !expected.every((name) => names.includes(name))
  ) {
    report(
      source,
      `Export exactly the named components: ${expected.join(", ")}.`,
    );
  }
}

function mismatchedComponentExport(specifier, statement) {
  if (specifier.isTypeOnly) return false;
  const localName = (specifier.propertyName ?? specifier.name).text;
  const publicName = specifier.name.text;
  const isComponent = /^[A-Z]/.test(localName) || /^[A-Z]/.test(publicName);
  return isComponent && (statement.moduleSpecifier || localName !== publicName);
}

function checkComponentExportNames(statement, report) {
  if (
    !ts.isExportDeclaration(statement) ||
    statement.isTypeOnly ||
    !statement.exportClause ||
    !ts.isNamedExports(statement.exportClause)
  )
    return;
  for (const specifier of statement.exportClause.elements) {
    if (mismatchedComponentExport(specifier, statement)) {
      report(
        specifier,
        "Component exports must keep their local declaration name; declare the filename-matching component locally instead of aliasing or re-exporting it.",
      );
    }
  }
}

function checkExportStyle(source, report) {
  for (const statement of source.statements) {
    checkComponentExportNames(statement, report);
    if (ts.isExportAssignment(statement)) {
      report(statement, "Owned components must use named exports.");
    }
    if (ts.isFunctionDeclaration(statement) && exported(statement)) {
      const isDefault = statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword,
      );
      report(
        statement,
        isDefault
          ? "Owned components must use named exports."
          : "Declare the component locally, then export { Name }.",
      );
    }
  }
}

function checkProps(source, _expected, report) {
  const allowed = expectedComponentNames(
    source,
    basename(source.fileName, ".tsx"),
  ).map((name) => `${name}Props`);
  for (const statement of source.statements) {
    if (
      !ts.isTypeAliasDeclaration(statement) &&
      !ts.isInterfaceDeclaration(statement)
    )
      continue;
    const name = statement.name.text;
    if (name.endsWith("Props") && !allowed.includes(name)) {
      report(
        statement,
        `Props type must be named one of: ${allowed.join(", ")}.`,
      );
    }
  }
}

function isClientBoundary(source) {
  for (const statement of source.statements) {
    if (
      !ts.isExpressionStatement(statement) ||
      !ts.isStringLiteral(statement.expression)
    )
      break;
    if (statement.expression.text === "use client") return true;
  }
  return false;
}

function isRuntimeImport(statement) {
  const clause = statement.importClause;
  if (!clause) return true;
  if (clause.isTypeOnly) return false;
  if (
    clause.name ||
    !clause.namedBindings ||
    ts.isNamespaceImport(clause.namedBindings) ||
    clause.namedBindings.elements.length === 0
  )
    return true;
  return clause.namedBindings.elements.some(
    (specifier) => !specifier.isTypeOnly,
  );
}

function isServerRuntimeImport(statement) {
  return (
    ts.isImportDeclaration(statement) &&
    isRuntimeImport(statement) &&
    ts.isStringLiteral(statement.moduleSpecifier) &&
    (serverImports.test(statement.moduleSpecifier.text) ||
      isBuiltin(statement.moduleSpecifier.text) ||
      /-server(?:\.[cm]?[jt]sx?)?$/.test(statement.moduleSpecifier.text))
  );
}

function isTypeOnlyReexport(statement) {
  if (!ts.isExportDeclaration(statement) || !statement.exportClause)
    return false;
  return (
    ts.isNamedExports(statement.exportClause) &&
    statement.exportClause.elements.length > 0 &&
    statement.exportClause.elements.every((part) => part.isTypeOnly)
  );
}

function runtimeDependencySpecifier(statement) {
  if (
    (!ts.isImportDeclaration(statement) &&
      !ts.isExportDeclaration(statement)) ||
    statement.isTypeOnly ||
    !statement.moduleSpecifier ||
    !ts.isStringLiteral(statement.moduleSpecifier)
  )
    return null;
  if (ts.isImportDeclaration(statement) && !isRuntimeImport(statement))
    return null;
  if (isTypeOnlyReexport(statement)) return null;
  return statement.moduleSpecifier.text;
}

function browserNavigationImport(statement, specifier) {
  if (
    !["next/navigation", "next-intl/navigation"].includes(specifier) ||
    !ts.isImportDeclaration(statement)
  )
    return false;
  const bindings = statement.importClause?.namedBindings;
  return (
    bindings &&
    ts.isNamedImports(bindings) &&
    bindings.elements.some(
      (part) =>
        !part.isTypeOnly &&
        /^(useRouter|useParams|usePathname|useSearchParams|useSelectedLayoutSegments?)$/.test(
          (part.propertyName ?? part.name).text,
        ),
    )
  );
}

function helperModuleTarget(filename, specifier, modules) {
  let base;
  if (specifier.startsWith("@/")) base = `src/${specifier.slice(2)}`;
  else if (specifier.startsWith("."))
    base = relative(".", resolve(filename, "..", specifier))
      .split(sep)
      .join("/");
  else return null;
  return [base, `${base}.ts`, `${base}/index.ts`].find(
    (file) => modules.has(file) && !file.endsWith(".tsx"),
  );
}

function isBrowserProperty(node, source) {
  if (!ts.isPropertyAccessExpression(node)) return false;
  const owner = node.expression.getText(source);
  if (
    /^(window|document|navigator|localStorage|sessionStorage|indexedDB)$/.test(
      owner,
    )
  )
    return true;
  if (owner === "globalThis")
    return /^(window|document|navigator|localStorage|sessionStorage|indexedDB)$/.test(
      node.name.text,
    );
  return (
    owner === "URL" &&
    /^(createObjectURL|revokeObjectURL)$/.test(node.name.text)
  );
}

function integrationSyntax(source) {
  const result = { client: false, server: false, fetch: false };
  function visit(node) {
    if (ts.isTypeNode(node)) return;
    if (isBrowserProperty(node, source)) result.client = true;
    if (
      ts.isCallExpression(node) &&
      /^(fetch|globalThis\.fetch)$/.test(node.expression.getText(source))
    )
      result.fetch = true;
    ts.forEachChild(node, visit);
  }
  visit(source);
  return result;
}

function dependencyIntegrations(statement, specifier) {
  return {
    server: serverImports.test(specifier) || isBuiltin(specifier),
    client:
      /^(firebase(?:\/|$)|@firebase-oss\/ui-(?:react|core)(?:\/|$)|next-themes(?:\/|$)|client-only$)/.test(
        specifier,
      ) || browserNavigationImport(statement, specifier),
    fetch: false,
  };
}

// A lazy `import("…")` still runs the module, so it counts like a static one.
function dynamicImportDependencies(source) {
  const dependencies = [];
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    )
      dependencies.push([node, node.arguments[0].text]);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return dependencies;
}

function mergeIntegrations(result, child) {
  for (const key of Object.keys(result)) result[key] ||= child[key];
}

// Follow hooks/helpers, but stop at component imports: composing an integration
// component does not make its presenter an integration component.
function componentIntegrations(source, filename, modules, visited = new Set()) {
  if (visited.has(filename))
    return { client: false, server: false, fetch: false };
  visited.add(filename);
  const result = integrationSyntax(source);
  const dependencies = [
    ...source.statements.map((statement) => [
      statement,
      runtimeDependencySpecifier(statement),
    ]),
    ...dynamicImportDependencies(source),
  ];
  for (const [statement, specifier] of dependencies) {
    if (!specifier) continue;
    mergeIntegrations(result, dependencyIntegrations(statement, specifier));
    const target = helperModuleTarget(filename, specifier, modules);
    if (!target) continue;
    const child = componentIntegrations(
      ts.createSourceFile(
        target,
        modules.get(target),
        ts.ScriptTarget.Latest,
        true,
      ),
      target,
      modules,
      visited,
    );
    // A server-only helper may import the Firebase SDK (FirebaseServerApp)
    // without making its Server Component a browser integration.
    if (hasServerOnlyMarker(childSource(target, modules))) child.client = false;
    mergeIntegrations(result, child);
  }
  return result;
}

function childSource(target, modules) {
  return ts.createSourceFile(
    target,
    modules.get(target),
    ts.ScriptTarget.Latest,
    true,
  );
}

function hasServerOnlyMarker(source) {
  return source.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      statement.moduleSpecifier.text === "server-only" &&
      !statement.importClause,
  );
}

function integrationKinds(integration, clientBoundary) {
  return {
    client: integration.client || (integration.fetch && clientBoundary),
    server: integration.server || (integration.fetch && !clientBoundary),
  };
}

function integrationNameMessages(stem, client, server) {
  const messages = [];
  if (client && !stem.endsWith("-client"))
    messages.push(
      "Browser integration components must use a -client.tsx filename.",
    );
  if (server && !stem.endsWith("-server"))
    messages.push(
      "Server integration components must use a -server.tsx filename.",
    );
  if (stem.endsWith("-client") && !client)
    messages.push(
      "Presentation components must not use the -client suffix; UI state, events, hooks and use client alone are not integrations.",
    );
  return messages;
}

function integrationBoundaryMessages(source, stem, clientBoundary, client) {
  const messages = [];
  if (client && !clientBoundary)
    messages.push('Browser integration components must declare "use client".');
  if (stem.endsWith("-server") && clientBoundary)
    messages.push('A -server.tsx component cannot declare "use client".');
  if (stem.endsWith("-server") && !hasServerOnlyMarker(source))
    messages.push('A -server.tsx component must import "server-only".');
  return messages;
}

export function inspectComponentRuntime(
  content,
  filename,
  modules = new Map(),
) {
  if (!isOwnedComponent(filename)) return [];
  filename = filename.replaceAll("\\", "/");
  const source = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const stem = basename(filename, ".tsx");
  const clientBoundary = isClientBoundary(source);
  const integration = componentIntegrations(source, filename, modules);
  const { client, server } = integrationKinds(integration, clientBoundary);
  const messages = [
    ...integrationNameMessages(stem, client, server),
    ...integrationBoundaryMessages(source, stem, clientBoundary, client),
  ];
  return messages.map((message) => ({
    file: filename,
    line: 1,
    column: 1,
    message,
  }));
}

function checkClientImports(source, report) {
  if (!isClientBoundary(source)) return;
  for (const statement of source.statements) {
    if (isServerRuntimeImport(statement)) {
      report(
        statement,
        "Never import server-only modules in a client boundary.",
      );
    }
    if (
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression) &&
      statement.expression.text === "use server"
    ) {
      report(statement, "Do not mix use client and use server in one module.");
    }
  }
}

function checkFieldControllerNames(source, stem, report) {
  const fieldStem = stem.replace(/-(client|server)$/, "");
  if (!fieldStem.endsWith("-field")) return;

  function visit(node) {
    if (
      ts.isJsxSelfClosingElement(node) &&
      node.tagName.getText(source) === "Controller"
    ) {
      const name = node.attributes.properties.find(
        (attribute) =>
          ts.isJsxAttribute(attribute) && attribute.name.text === "name",
      );
      if (name?.initializer && ts.isStringLiteral(name.initializer)) {
        const fieldName = name.initializer.text.replace(
          /[A-Z]/g,
          (letter) => `-${letter.toLowerCase()}`,
        );
        if (
          fieldStem !== `${fieldName}-field` &&
          !fieldStem.endsWith(`-${fieldName}-field`)
        ) {
          report(
            name,
            `Field component filename must match Controller name="${name.initializer.text}" (e.g. *-${fieldName}-field.tsx).`,
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
}

function checkProfilePropDrilling(source, report) {
  function visit(node) {
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      /^(ProfileFormClient|ProfileAvatarFieldClient|ProfileSignOutButton)$/.test(
        node.tagName.getText(source),
      )
    ) {
      for (const attribute of node.attributes.properties) {
        if (ts.isJsxAttribute(attribute) && attribute.name.text === "profile") {
          report(
            attribute,
            "Pass focused field/form/button props instead of the entire profile controller.",
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
}

function jsxEntries(source, root = source) {
  const elements = [];

  function visit(node, ancestors = []) {
    if (ts.isJsxElement(node)) {
      const name = node.openingElement.tagName.getText(source);
      elements.push({ name, node: node.openingElement, ancestors });
      for (const child of node.children) visit(child, [...ancestors, name]);
      return;
    }
    if (ts.isJsxSelfClosingElement(node)) {
      elements.push({ name: node.tagName.getText(source), node, ancestors });
      return;
    }
    ts.forEachChild(node, (child) => visit(child, ancestors));
  }

  visit(root);
  return elements;
}

function normalizeProfileTag(name) {
  // Normalize colocated compound form variants for composition checks.
  return name.replace(/^ProfileFormClient/, "ProfileForm");
}

function profileElements(elements, name) {
  return elements.filter(
    (element) =>
      normalizeProfileTag(element.name) === normalizeProfileTag(name),
  );
}

function isInsideProfile(element, ancestors) {
  const parents = element.ancestors.slice(-ancestors.length).reverse();
  return (
    parents.length === ancestors.length &&
    ancestors.every(
      (name, index) =>
        normalizeProfileTag(parents[index]) === normalizeProfileTag(name),
    )
  );
}

function requireProfilePlacement(source, elements, name, parents, report) {
  const matching = profileElements(elements, name);
  if (
    matching.length !== 1 ||
    !matching.every((element) => isInsideProfile(element, parents))
  ) {
    report(source, `${name} must be inside ${parents.join(" and ")}.`);
  }
}

function checkProfileCardSafety(source, elements, report) {
  const cards = profileElements(elements, "Card");
  if (cards.length !== 1 || cards[0].ancestors.length > 0) {
    report(source, "ProfileCard must render one native Card as its root.");
  }
  if (profileElements(elements, "ProfileFormClient").length) {
    report(
      source,
      "ProfileCard must accept children; compose profile UI in ProfileSectionClient.",
    );
  }
  for (const primitive of [
    "CardHeader",
    "CardAction",
    "CardTitle",
    "CardDescription",
    "CardContent",
    "CardFooter",
  ]) {
    if (profileElements(elements, primitive).length !== 1) {
      report(source, `ProfileCard must wrap exactly one ${primitive}.`);
    }
  }
}

function checkProfileSectionAction(source, elements, action, report) {
  const buttons = profileElements(elements, action);
  if (action === "ProfileSignOutButton" && buttons.length === 0) return;

  requireProfilePlacement(
    source,
    elements,
    action,
    ["ProfileCardFooter", "ProfileFormClient", "ProfileCard"],
    report,
  );
  for (const button of buttons) {
    const typeProp = button.node.attributes.properties.find(
      (attribute) =>
        ts.isJsxAttribute(attribute) && attribute.name.text === "type",
    );
    if (typeProp) {
      report(
        typeProp,
        `${action} must not accept an override of its fixed type.`,
      );
    }
  }
}

function checkProfileSectionSafety(source, elements, report) {
  if (profileElements(elements, "ProfileCard").length === 0) {
    report(source, "ProfileSectionClient must compose ProfileCard.");
  }
  requireProfilePlacement(
    source,
    elements,
    "ProfileFormClient",
    ["ProfileCard"],
    report,
  );
  requireProfilePlacement(
    source,
    elements,
    "ProfileCardHeader",
    ["ProfileFormClient", "ProfileCard"],
    report,
  );
  for (const part of ["ProfileCardTitle", "ProfileCardDescription"]) {
    requireProfilePlacement(
      source,
      elements,
      part,
      ["ProfileCardHeader", "ProfileFormClient", "ProfileCard"],
      report,
    );
  }
  requireProfilePlacement(
    source,
    elements,
    "ProfileDisplayNameField",
    ["FieldGroup", "ProfileCardContent", "ProfileFormClient", "ProfileCard"],
    report,
  );
  requireProfilePlacement(
    source,
    elements,
    "ProfileCardFooter",
    ["ProfileFormClient", "ProfileCard"],
    report,
  );
  for (const action of ["ProfileSaveButton", "ProfileSignOutButton"]) {
    checkProfileSectionAction(source, elements, action, report);
  }
  if (
    profileElements(elements, "form").length ||
    profileElements(elements, "Card").length
  ) {
    report(
      source,
      "ProfileSectionClient must delegate native Card and form roots.",
    );
  }
}

function checkProfileProviderSafety(source, elements, report) {
  // `Form` is the Base UI wrapper from ui/extensions/form, which renders the <form>.
  const nativeForms = [
    ...profileElements(elements, "form"),
    ...profileElements(elements, "Form"),
  ];
  if (
    nativeForms.length !== 1 ||
    !isInsideProfile(nativeForms[0], ["FormProvider"])
  ) {
    report(
      source,
      "ProfileFormClient must provide exactly one HTML form inside FormProvider.",
    );
  }
  if (profileElements(elements, "Card").length > 0) {
    report(
      source,
      "ProfileFormClient must delegate the Card root to ProfileCard.",
    );
  }
  if (
    profileElements(elements, "FieldGroup").length ||
    profileElements(elements, "Button").length
  ) {
    report(
      source,
      "ProfileFormClient must delegate fields and actions to its children.",
    );
  }
}

function checkProfileContentSafety(source, elements, report) {
  if (
    profileElements(elements, "FieldGroup").length !== 1 ||
    profileElements(elements, "CardContent").length ||
    profileElements(elements, "form").length
  ) {
    report(
      source,
      "ProfileFormClientContent must render exactly one FieldGroup without CardContent or a nested form.",
    );
  }
}

function checkProfileFooterSafety(source, elements, report) {
  if (
    profileElements(elements, "div").length !== 1 ||
    profileElements(elements, "CardFooter").length > 0
  ) {
    report(
      source,
      "ProfileFormClientFooter must render a layout div inside ProfileCardFooter.",
    );
  }
}

function attributePosition(attributes, name) {
  return attributes.findIndex(
    (attribute) => ts.isJsxAttribute(attribute) && attribute.name.text === name,
  );
}

function spreadAfter(attributes, position) {
  return attributes.slice(position + 1).some(ts.isJsxSpreadAttribute);
}

function checkFixedProfileButtonType(
  button,
  attributes,
  stem,
  expected,
  report,
) {
  const typeIndex = attributePosition(attributes, "type");
  const typeAttribute = attributes[typeIndex];
  const typeValue = typeAttribute?.initializer;
  if (
    !typeValue ||
    !ts.isStringLiteral(typeValue) ||
    typeValue.text !== expected ||
    spreadAfter(attributes, typeIndex)
  ) {
    report(
      button.node,
      `${stem} must enforce type="${expected}" after any spread props.`,
    );
  }
}

function checkFixedProfileButtonDisabled(button, attributes, stem, report) {
  const disabledIndex = attributePosition(attributes, "disabled");
  if (disabledIndex < 0 || spreadAfter(attributes, disabledIndex)) {
    report(
      button.node,
      `${stem} must preserve disabled state after spread props.`,
    );
  }
}

function checkProfileButtonSafety(source, elements, report, stem) {
  const expected = stem === "profile-save-button" ? "submit" : "button";
  const buttons = profileElements(elements, "Button");
  if (buttons.length !== 1) {
    report(source, `${stem} must render exactly one Button.`);
    return;
  }
  const button = buttons[0];
  const attributes = button.node.attributes.properties;
  checkFixedProfileButtonType(button, attributes, stem, expected, report);
  checkFixedProfileButtonDisabled(button, attributes, stem, report);
}

function checkProfileFormSafety(source, stem, report) {
  const checks = {
    "profile-card": checkProfileCardSafety,
    "profile-section-client": checkProfileSectionSafety,
    "profile-section": checkProfileSectionSafety,
    "profile-form-client": checkProfileProviderSafety,
    "profile-form": checkProfileProviderSafety,
    "profile-form-content": checkProfileContentSafety,
    "profile-form-footer": checkProfileFooterSafety,
    "profile-save-button": (file, elements, addIssue) =>
      checkProfileButtonSafety(file, elements, addIssue, stem),
    "profile-sign-out-button": (file, elements, addIssue) =>
      checkProfileButtonSafety(file, elements, addIssue, stem),
  };
  const check = checks[stem];
  if (
    !check ||
    !source.fileName.replaceAll("\\", "/").includes("/profile/_components/")
  ) {
    return;
  }
  if (stem === "profile-form-client" || stem === "profile-form") {
    const namePrefix =
      stem === "profile-form-client" ? "ProfileFormClient" : "ProfileForm";
    const checks = [
      [namePrefix, checkProfileProviderSafety],
      [`${namePrefix}Content`, checkProfileContentSafety],
      [`${namePrefix}Footer`, checkProfileFooterSafety],
    ];
    for (const [name, partCheck] of stem === "profile-form-client"
      ? checks.slice(0, 1)
      : checks) {
      const declaration = source.statements.find(
        (statement) =>
          ts.isFunctionDeclaration(statement) && statement.name?.text === name,
      );
      if (declaration)
        partCheck(source, jsxEntries(source, declaration), report);
    }
    return;
  }
  check(source, jsxEntries(source), report);
}

function checkHomeSafety(source, stem, report) {
  if (stem !== "home-client") return;
  const elements = jsxEntries(source);
  if (!elements.some((element) => element.name === "Home")) {
    report(source, "HomeClient must compose Home.");
  }
}

const statefulHooks = new Set([
  "useState",
  "useReducer",
  "useEffect",
  "useLayoutEffect",
  "useSyncExternalStore",
]);

function checkStateHookImport(bindings, report) {
  if (!bindings || !ts.isNamedImports(bindings)) return;
  for (const element of bindings.elements) {
    if (element.isTypeOnly) continue;
    if (statefulHooks.has((element.propertyName ?? element.name).text)) {
      report(
        element,
        "Move state and effects into a responsibility-specific custom hook; keep components declarative.",
      );
    }
  }
}

function hasValueImport(bindings) {
  if (!bindings || !ts.isNamedImports(bindings)) return true;
  return bindings.elements.some((element) => !element.isTypeOnly);
}

function checkHookImport(statement, report) {
  if (
    !ts.isImportDeclaration(statement) ||
    !ts.isStringLiteral(statement.moduleSpecifier)
  )
    return;
  const module = statement.moduleSpecifier.text;
  const clause = statement.importClause;
  if (clause?.isTypeOnly) return;
  const bindings = clause?.namedBindings;
  const valueImport = hasValueImport(bindings);
  if (valueImport && /^(firebase\/|@\/lib\/firebase\/)/.test(module)) {
    report(
      statement,
      "Move Firebase/session operations into a responsibility-specific custom hook or data module.",
    );
  }
  if (module === "react") checkStateHookImport(bindings, report);
}

function isAsyncWorkflow(node, source) {
  if (
    ts.isFunctionDeclaration(node) &&
    source.statements.includes(node) &&
    /^[A-Z]/.test(node.name?.text ?? "")
  )
    return false;
  if (
    !ts.isFunctionDeclaration(node) &&
    !ts.isArrowFunction(node) &&
    !ts.isFunctionExpression(node)
  )
    return false;
  return node.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword,
  );
}

function isStateHookCall(node) {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    statefulHooks.has(node.expression.name.text)
  );
}

function hookImportNames(source) {
  const names = new Map();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      names.set(element.name.text, (element.propertyName ?? element.name).text);
    }
  }
  return names;
}

function checkComponentHook(component, source, report) {
  const names = hookImportNames(source);
  const hooks = [];
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      const localName = ts.isIdentifier(expression)
        ? expression.text
        : ts.isPropertyAccessExpression(expression)
          ? expression.name.text
          : "";
      const name = names.get(localName) ?? localName;
      if (/^use[A-Z]/.test(name)) hooks.push({ name, node });
    }
    ts.forEachChild(node, visit);
  }
  visit(component);
  if (!hooks.length) return;
  const presentationHooks = new Set([
    "useTranslations",
    "useFormatter",
    "useId",
    "useFormContext",
    "useWatch",
    "useRender",
  ]);
  const orchestrationHooks = hooks.filter(
    (hook) => !presentationHooks.has(hook.name),
  );
  if (!orchestrationHooks.length) return;
  const expected = `use${component.name.text}`;
  if (
    orchestrationHooks.length !== 1 ||
    orchestrationHooks[0].name !== expected
  ) {
    report(
      component,
      `${component.name.text} must delegate hook coordination to ${expected} in a separate hook module; call only that component hook.`,
    );
    return;
  }
  if (
    !names.has(
      ts.isIdentifier(orchestrationHooks[0].node.expression)
        ? orchestrationHooks[0].node.expression.text
        : "",
    )
  ) {
    report(
      component,
      `${expected} must be imported from a separate hook module.`,
    );
  }
}

function checkHookResponsibilities(source, report) {
  for (const statement of source.statements) checkHookImport(statement, report);
  function hasLogic(node) {
    if (
      ts.isBinaryExpression(node) &&
      [
        ts.SyntaxKind.AmpersandAmpersandToken,
        ts.SyntaxKind.BarBarToken,
        ts.SyntaxKind.QuestionQuestionToken,
      ].includes(node.operatorToken.kind)
    )
      return true;
    let found = false;
    ts.forEachChild(node, (child) => {
      if (hasLogic(child)) found = true;
    });
    return found;
  }
  function checkDerivedState(node) {
    if (ts.isIfStatement(node) && hasLogic(node.expression)) {
      report(
        node.expression,
        "Derive compound loading/auth/error decisions in a custom hook; render a named state or discriminated status.",
      );
    }
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      hasLogic(node.initializer)
    ) {
      report(
        node.initializer,
        "Derive compound state in a responsibility-specific custom hook instead of component locals.",
      );
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken &&
      /error/i.test(node.left.getText(source))
    ) {
      report(
        node,
        "Resolve error-message fallbacks in a custom hook, not in component rendering.",
      );
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.InKeyword
    ) {
      report(
        node,
        "Do not use inline type guards ('in' operator) in components; derive resolved values in a custom hook.",
      );
    }
    if (
      ts.isJsxAttribute(node) &&
      node.name.text === "key" &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression &&
      ts.isConditionalExpression(node.initializer.expression)
    ) {
      report(
        node.initializer.expression,
        "Derive component key identifiers in a custom hook instead of inline ternary expressions.",
      );
    }
  }
  function visit(node) {
    checkDerivedState(node);
    if (isAsyncWorkflow(node, source)) {
      report(
        node,
        "Move asynchronous workflow handlers into a responsibility-specific custom hook.",
      );
    }
    if (isStateHookCall(node)) {
      report(
        node,
        "Move state and effects into a responsibility-specific custom hook; keep components declarative.",
      );
    }
    ts.forEachChild(node, visit);
  }
  for (const statement of source.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      /^[A-Z]/.test(statement.name?.text ?? "")
    ) {
      checkComponentHook(statement, source, report);
      visit(statement);
    }
  }
}

const dataFunctionPrefix =
  /^(read|write|save|create|update|delete|remove|upload|fetch|get|set|list|verify)[A-Z]/;

export function inspectDataModuleConventions(content, filename) {
  const path = filename.replaceAll("\\", "/");
  if (!/(?:^|\/)data\.ts$/.test(path) || /\.test\.ts$/.test(path)) return [];
  const source = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const findings = [];
  function report(node, message) {
    const pos = source.getLineAndCharacterOfPosition(node.getStart(source));
    findings.push({
      file: filename,
      line: pos.line + 1,
      column: pos.character + 1,
      message,
    });
  }
  const nonEmptyLines = content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0).length;
  if (nonEmptyLines > 150) {
    report(
      source,
      `data.ts modules must not exceed 150 non-empty lines (received ${nonEmptyLines}); decompose unrelated concerns into focused _lib/ helpers.`,
    );
  }
  for (const statement of source.statements) {
    for (const fn of exportedDataFunctionNames(statement)) {
      if (!dataFunctionPrefix.test(fn.name)) {
        report(
          fn.node,
          `Exported data.ts function "${fn.name}" must start with an explicit data operation verb (read, write, save, create, update, delete, remove, upload, fetch, get, set, list, verify) followed by a PascalCase domain noun.`,
        );
      }
    }
  }
  return findings;
}

function exportedDataFunctionNames(statement) {
  if (
    ts.isFunctionDeclaration(statement) &&
    statement.name &&
    exported(statement)
  ) {
    return [{ name: statement.name.text, node: statement.name }];
  }
  if (!ts.isVariableStatement(statement) || !exported(statement)) return [];
  return statement.declarationList.declarations
    .filter(
      (declaration) =>
        ts.isIdentifier(declaration.name) &&
        declaration.initializer &&
        (ts.isArrowFunction(declaration.initializer) ||
          ts.isFunctionExpression(declaration.initializer)),
    )
    .map((declaration) => ({
      name: declaration.name.text,
      node: declaration.name,
    }));
}

export function inspectComponentPlacement(filename) {
  const path = filename.replaceAll("\\", "/");
  if (
    !path.startsWith("src/components/") ||
    !/\.[cm]?[jt]sx?$/.test(path) ||
    /^src\/components\/(ui|firebase|ai-elements)\//.test(path)
  )
    return [];
  return [
    {
      file: filename,
      line: 1,
      column: 1,
      message:
        "Place shared application components in src/components/ui/extensions/ or route-private components in src/app/**/_components/; other src/components directories are reserved for registry source.",
    },
  ];
}

export function inspectLibPlacement(filename) {
  const path = filename.replaceAll("\\", "/");
  if (!/\.[cm]?[jt]sx?$/.test(path)) return [];
  if (
    path.startsWith("src/lib/") &&
    !/^src\/lib\/(?:[^/]+|(?:firebase|usage)\/[^/]+)\.[cm]?[jt]sx?$/.test(path)
  ) {
    return [
      {
        file: filename,
        line: 1,
        column: 1,
        message:
          "Keep domain helpers flat in src/lib/*.ts (e.g. role.ts, locale.ts, theme.ts), SDK clients in src/lib/firebase/*.ts, and route-specific persistence/guards in route-private _lib/.",
      },
    ];
  }
  if (/^src\/app\/(?:.*\/)?_lib\/defaults(?:\.test)?\.tsx?$/.test(path)) {
    return [
      {
        file: filename,
        line: 1,
        column: 1,
        message:
          "Colocate route data reads and mutations together in _lib/data.ts rather than creating a separate _lib/defaults.ts module.",
      },
    ];
  }
  return [];
}

export function inspectComponent(content, filename) {
  if (!isOwnedComponent(filename)) return [];
  const source = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const findings = [];
  const report = (node, message) => {
    const position = source.getLineAndCharacterOfPosition(
      node.getStart(source),
    );
    findings.push({
      file: filename,
      line: position.line + 1,
      column: position.character + 1,
      message,
    });
  };
  const fileStem = basename(filename.replaceAll("\\", "/"), ".tsx");
  const stem = fileStem;
  checkFileName(source, fileStem, report);
  checkStemComponentTermParity(source, fileStem, report);
  checkPrimaryExport(source, stem, report);
  checkExportStyle(source, report);
  checkProps(source, pascalCase(stem), report);
  checkClientImports(source, report);
  checkComponentComposition(
    source,
    expectedComponentNames(source, stem),
    report,
  );
  checkHookResponsibilities(source, report);
  checkFieldControllerNames(source, stem, report);
  checkProfilePropDrilling(source, report);
  checkProfileFormSafety(source, stem, report);
  checkHomeSafety(source, stem, report);
  return findings;
}

function hasBannedNamingTerm(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .split(/[^A-Za-z]+/)
    .some((word) => /^(view|screen|presentation)$/i.test(word));
}

function isOwnedNamingFile(filename) {
  const path = filename.replaceAll("\\", "/");
  return (
    path.startsWith("src/") &&
    /\.tsx?$/.test(path) &&
    !/\.(test|spec|stories)\.tsx?$/.test(path) &&
    !/^src\/components\/(firebase|ai-elements)\//.test(path) &&
    (!path.startsWith("src/components/ui/") ||
      path.startsWith("src/components/ui/extensions/"))
  );
}

const namedDeclarationKinds = new Set([
  ts.SyntaxKind.ExportSpecifier,
  ts.SyntaxKind.NamespaceExport,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.ClassExpression,
  ts.SyntaxKind.EnumDeclaration,
  ts.SyntaxKind.TypeParameter,
  ts.SyntaxKind.ImportSpecifier,
  ts.SyntaxKind.ImportClause,
  ts.SyntaxKind.NamespaceImport,
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.ClassDeclaration,
  ts.SyntaxKind.TypeAliasDeclaration,
  ts.SyntaxKind.InterfaceDeclaration,
  ts.SyntaxKind.VariableDeclaration,
  ts.SyntaxKind.BindingElement,
  ts.SyntaxKind.Parameter,
]);

function declaredName(node) {
  return namedDeclarationKinds.has(node.kind) ? node.name : undefined;
}

export function inspectNaming(content, filename) {
  if (!isOwnedNamingFile(filename)) return [];
  const findings = [];
  const source = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true,
    filename.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  function report(node, name) {
    const position = source.getLineAndCharacterOfPosition(
      node.getStart(source),
    );
    findings.push({
      file: filename,
      line: position.line + 1,
      column: position.character + 1,
      message: `Do not use View or Screen (or Presentation) as naming terms (${name}); choose a concrete responsibility such as Status, Section, Content or Flow.`,
    });
  }
  if (hasBannedNamingTerm(basename(filename).replace(/\.tsx?$/, "")))
    report(source, basename(filename));
  function visit(node) {
    const name = declaredName(node);
    if (name && ts.isIdentifier(name) && hasBannedNamingTerm(name.text))
      report(name, name.text);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return findings;
}

export function isOwnedHookModule(filename) {
  const path = filename.replaceAll("\\", "/");
  return (
    /^(?:src\/app\/(?:.*\/)?_hooks\/|src\/hooks\/(?!use-mobile\.))[^/]+\.tsx?$/.test(
      path,
    ) && !/\.(test|spec|stories)\.tsx?$/.test(path)
  );
}

function exportedHookDeclarations(statement) {
  if (
    ts.isFunctionDeclaration(statement) &&
    statement.name &&
    exported(statement) &&
    /^use[A-Z]/.test(statement.name.text)
  ) {
    return [{ name: statement.name.text, node: statement.name }];
  }
  if (!ts.isVariableStatement(statement) || !exported(statement)) return [];
  return statement.declarationList.declarations
    .filter(
      (declaration) =>
        ts.isIdentifier(declaration.name) &&
        /^use[A-Z]/.test(declaration.name.text),
    )
    .map((declaration) => ({
      name: declaration.name.text,
      node: declaration.name,
    }));
}

function isNamedHookExport(statement) {
  return (
    ts.isExportDeclaration(statement) &&
    !statement.isTypeOnly &&
    statement.exportClause &&
    ts.isNamedExports(statement.exportClause)
  );
}

function exportedHookSpecifier(specifier, statement, report) {
  if (specifier.isTypeOnly || !/^use[A-Z]/.test(specifier.name.text)) return [];
  const local = specifier.propertyName?.text ?? specifier.name.text;
  if (statement.moduleSpecifier || local !== specifier.name.text) {
    report(
      specifier,
      "Hook exports must come from a matching local declaration; hook aliases and re-exports are not allowed.",
    );
  }
  return [{ name: specifier.name.text, node: specifier.name }];
}

function namedHookExports(statement, report) {
  if (!isNamedHookExport(statement)) return [];
  return statement.exportClause.elements.flatMap((specifier) =>
    exportedHookSpecifier(specifier, statement, report),
  );
}

function validateHookExports(
  source,
  filename,
  stem,
  expected,
  exports,
  report,
) {
  if (!expected || !kebabCase.test(stem)) {
    if (exports.length || stem.startsWith("use-")) {
      report(
        source,
        `Owned hook filenames must use use-<semantic-name>.ts in kebab-case (received "${basename(filename)}").`,
      );
    }
    return;
  }
  if (!exports.some((item) => item.name === expected)) {
    report(
      source,
      `Hook file "${basename(filename)}" must export "${expected}" with the same exact name.`,
    );
  }
  for (const item of exports) {
    if (item.name !== expected) {
      report(
        item.node,
        `Hook "${item.name}" does not match filename "${basename(filename)}"; rename this file to "${tokenizePascal(item.name).join("-")}.ts" or export "${expected}".`,
      );
    }
  }
}

export function inspectHookFilename(content, filename) {
  if (!isOwnedHookModule(filename)) return [];
  const source = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true,
    filename.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const findings = [];
  const stem = basename(filename.replaceAll("\\", "/")).replace(/\.tsx?$/, "");
  const expected = stem.startsWith("use-")
    ? `use${pascalCase(stem.slice(4))}`
    : null;
  function report(node, message) {
    const pos = source.getLineAndCharacterOfPosition(node.getStart(source));
    findings.push({
      file: filename,
      line: pos.line + 1,
      column: pos.character + 1,
      message,
    });
  }
  const exports = source.statements.flatMap((statement) => [
    ...exportedHookDeclarations(statement),
    ...namedHookExports(statement, report),
  ]);
  validateHookExports(source, filename, stem, expected, exports, report);
  return findings;
}

function isUiPhaseStatusLiteral(node) {
  return (
    Boolean(node) && ts.isStringLiteral(node) && uiPhaseStatuses.has(node.text)
  );
}

function hasUiPhaseStatusType(node) {
  return (
    node && ts.isLiteralTypeNode(node) && isUiPhaseStatusLiteral(node.literal)
  );
}

export function inspectUiPhaseStatus(content, filename) {
  const path = filename.replaceAll("\\", "/");
  if (
    !path.startsWith("src/") ||
    !/\.tsx?$/.test(path) ||
    /\.(test|spec|stories)\.tsx?$/.test(path)
  )
    return [];
  const source = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true,
    filename.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const findings = [];
  function report(node) {
    const pos = source.getLineAndCharacterOfPosition(node.getStart(source));
    findings.push({
      file: filename,
      line: pos.line + 1,
      column: pos.character + 1,
      message:
        "Do not model UI phases with status; use isLoading, isHidden, isError, or isReady.",
    });
  }
  function visit(node) {
    if (
      (ts.isPropertyAssignment(node) || ts.isPropertySignature(node)) &&
      node.name.getText(source) === "status" &&
      (isUiPhaseStatusLiteral(node.initializer) ||
        hasUiPhaseStatusType(node.type))
    )
      report(node);
    if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
        node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken ||
        node.operatorToken.kind ===
          ts.SyntaxKind.ExclamationEqualsEqualsToken ||
        node.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken) &&
      ((ts.isPropertyAccessExpression(node.left) &&
        node.left.name.text === "status" &&
        isUiPhaseStatusLiteral(node.right)) ||
        (ts.isPropertyAccessExpression(node.right) &&
          node.right.name.text === "status" &&
          isUiPhaseStatusLiteral(node.left)))
    )
      report(node);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return findings;
}

function scan(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return scan(path);
    return entry.isFile() ? [path] : [];
  });
}

export function checkComponents(root) {
  const files = scan(join(root, "src"));
  const modules = new Map(
    files
      .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
      .map((file) => [
        relative(root, file).split(sep).join("/"),
        readFileSync(file, "utf8"),
      ]),
  );
  return files.flatMap((file) => {
    const path = relative(root, file).split(sep).join("/");
    if (!/\.[cm]?[jt]sx?$/.test(path)) return [];
    const content = modules.get(path);
    return [
      ...inspectComponentPlacement(path),
      ...inspectLibPlacement(path),
      ...inspectDataModuleConventions(content, path),
      ...inspectComponentRuntime(content, path, modules),
      ...inspectNaming(content, path),
      ...inspectHookFilename(content, path),
      ...inspectUiPhaseStatus(content, path),
      ...inspectComponent(content, path),
    ];
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const findings = checkComponents(
    fileURLToPath(new URL("../../", import.meta.url)),
  );
  for (const issue of findings) {
    console.error(
      `${issue.file}:${issue.line}:${issue.column} ${issue.message}`,
    );
  }
  if (findings.length) process.exitCode = 1;
  else console.log("Component conventions: all owned files passed.");
}
