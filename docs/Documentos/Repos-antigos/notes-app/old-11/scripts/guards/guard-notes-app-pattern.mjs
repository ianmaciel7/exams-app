#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listApplicationComponentFiles } from "./component-scope-lib.mjs";
import { checkPrimitiveRoleAlignment as checkPrimitiveRoleAlignmentLib } from "./guard-notes-app-pattern-lib.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));

const NON_VISUAL_FILES = new Set([
  "auth-provider.tsx",
  "phone-auth-form.tsx",
  "spaces-list.tsx",
  "theme-provider.tsx",
]);

const COMPONENT_ROLE_SUFFIXES = new Set([
  "Accordion",
  "Action",
  "Alert",
  "Avatar",
  "Badge",
  "Breadcrumb",
  "Button",
  "Calendar",
  "Card",
  "Carousel",
  "Chart",
  "Checkbox",
  "Close",
  "Collapsible",
  "Combobox",
  "Command",
  "Content",
  "Description",
  "Dialog",
  "Drawer",
  "Dropdown",
  "Empty",
  "Field",
  "FieldGroup",
  "Footer",
  "Form",
  "Group",
  "Header",
  "Icon",
  "Input",
  "Item",
  "Label",
  "Link",
  "List",
  "Loading",
  "Media",
  "Menu",
  "Navigation",
  "Overlay",
  "Pagination",
  "Popover",
  "Portal",
  "Progress",
  "Provider",
  "Radio",
  "Resizable",
  "Scroll",
  "Select",
  "Separator",
  "Sheet",
  "Shell",
  "Sidebar",
  "Skeleton",
  "Slider",
  "Sonner",
  "Spinner",
  "Status",
  "Switcher",
  "Table",
  "Tabs",
  "Textarea",
  "Title",
  "Toast",
  "Toaster",
  "Toggle",
  "Tooltip",
  "Trigger",
  "Section",
  "FieldSet",
  "Figure",
  "Row",
  "Cell",
]);

const COMPONENT_NAME_EXEMPTIONS = new Set(["RequireAuth", "RequireGuest"]);
const CANONICAL_COMPONENT_EXEMPT_FILES = new Set([]);
const PASCAL_SEGMENTS = new Map([["oauth", "OAuth"]]);

function violation(file, rule, message) {
  return { file: path.relative(root, file), rule, message };
}

function toPascalCase(fileName) {
  return fileName
    .replace(/\.tsx$/, "")
    .split("-")
    .map(
      (part) =>
        PASCAL_SEGMENTS.get(part) ??
        `${part.charAt(0).toUpperCase()}${part.slice(1)}`
    )
    .join("");
}

function getComponentFunctionEntries(content) {
  const allFunctions = [
    ...content.matchAll(/function\s+([A-Za-z_][A-Za-z0-9_]*)\b/g),
  ];

  return allFunctions
    .filter((match) => /^[A-Z]/.test(match[1]))
    .map((match) => {
      const nextFunction = allFunctions.find(
        (candidate) => candidate.index > match.index
      );

      return {
        name: match[1],
        source: content.slice(
          match.index,
          nextFunction?.index ?? content.length
        ),
      };
    });
}

function hasComponentRoleSuffix(name) {
  return [...COMPONENT_ROLE_SUFFIXES].some((suffix) => name.endsWith(suffix));
}

function checkDedicatedHookOwnsState(filePath, fileName, content) {
  const componentName = toPascalCase(fileName);
  const component = getComponentFunctionEntries(content).find(
    ({ name }) => name === componentName
  );
  if (!component) {
    return [];
  }

  const hookName = `use${componentName}`;
  const hookCall = new RegExp(`\\b${hookName}\\s*\\(`);

  if (!hookCall.test(component.source)) {
    return [];
  }

  const statefulHooks = [
    "useState",
    "useReducer",
    "useEffect",
    "useLayoutEffect",
    "useInsertionEffect",
    "useTransition",
    "useDeferredValue",
    "useOptimistic",
    "useActionState",
    "useSyncExternalStore",
    "useRef",
    "useImperativeHandle",
  ];
  const directCalls = statefulHooks.filter((hook) =>
    new RegExp(`\\b${hook}\\s*\\(`).test(component.source)
  );

  if (directCalls.length === 0) {
    return [];
  }

  return [
    violation(
      filePath,
      "notes-app-dedicated-hook-owns-state",
      `${fileName} delegates behavior to ${hookName}; move component-owned ${directCalls.join(", ")} calls into that dedicated hook.`
    ),
  ];
}

function checkSpaceShellContract(filePath, fileName, content) {
  if (fileName !== "space-shell.tsx") {
    return [];
  }

  const requirements = [
    ["children", /children\??\s*:/],
    ["SidebarProvider root", /<SidebarProvider\b/],
    ["data-slot", /data-slot=["']space-shell["']/],
    ["cn layout merge", /className=\{cn\(/],
  ];
  const missing = requirements
    .filter(([, pattern]) => !pattern.test(content))
    .map(([name]) => name);

  if (missing.length === 0) {
    return [];
  }

  return [
    violation(
      filePath,
      "notes-app-space-shell-contract",
      `space-shell.tsx must preserve the SidebarProvider wrapper contract; missing ${missing.join(", ")}.`
    ),
  ];
}

function checkNativeSelectUsage(filePath, fileName, content) {
  if (!content.includes("NativeSelect")) {
    return [];
  }

  // NativeSelect is only allowed as an accessible screen-reader alternative
  // (e.g. sr-only focus:not-sr-only in drag-drop slots), not as a visible primary control.
  const nativeSelectPattern = /<NativeSelect\b[^>]*>/g;
  for (const match of content.matchAll(nativeSelectPattern)) {
    const tag = match[0];
    if (!tag.includes("sr-only")) {
      return [
        violation(
          filePath,
          "notes-app-no-visible-native-select",
          `${fileName} uses NativeSelect without 'sr-only'. Use the shared 'Select' primitive for visible selection controls per CONVENTIONS.md.`
        ),
      ];
    }
  }

  return [];
}

function checkFieldDescriptionNesting(filePath, fileName, content) {
  // FieldDescription renders a <p>. In HTML, <div>, <ul>, <ol>, <p> cannot be nested inside <p>.
  // Such components must compose FieldContent (<div data-slot="field-content">) instead.
  const fieldDescBlockPattern =
    /<FieldDescription\b[^>]*>([\s\S]*?)<\/FieldDescription>/g;

  for (const match of content.matchAll(fieldDescBlockPattern)) {
    const children = match[1];
    if (/<(div|ul|ol|p)\b/.test(children)) {
      return [
        violation(
          filePath,
          "notes-app-no-block-in-field-description",
          `${fileName} nests block elements (<div|ul|ol|p>) inside <FieldDescription>. FieldDescription renders a <p>, causing HTML hydration errors. Compose 'FieldContent' instead.`
        ),
      ];
    }
  }

  return [];
}

function checkPrimitiveRoleAlignment(filePath, fileName, content) {
  return checkPrimitiveRoleAlignmentLib(
    filePath,
    fileName,
    content,
    toPascalCase,
    violation
  );
}

function checkRawLayoutWrappers(filePath, fileName, content) {
  if (fileName === "phone-auth-form.tsx" || fileName.startsWith("sms-mfa-")) {
    return [];
  }

  if (/<div\s+\{\.\.\.props\}\s+className=/.test(content)) {
    return [
      violation(
        filePath,
        "notes-app-no-raw-layout-wrapper",
        `${fileName} must compose a role-specific ui primitive instead of forwarding layout props through a raw div.`
      ),
    ];
  }

  return [];
}

function checkComponentRoleNames(filePath, fileName, content) {
  const entries = getComponentFunctionEntries(content);
  const invalid = entries
    .map(({ name }) => name)
    .filter(
      (name) =>
        !COMPONENT_NAME_EXEMPTIONS.has(name) && !hasComponentRoleSuffix(name)
    );

  const violations = [];
  if (invalid.length > 0) {
    violations.push(
      violation(
        filePath,
        "notes-app-component-role-suffix",
        `${fileName} has component names without a recognized UI role suffix: ${invalid.join(", ")}.`
      )
    );
  }

  if (!CANONICAL_COMPONENT_EXEMPT_FILES.has(fileName)) {
    const canonicalName = toPascalCase(fileName);
    if (!entries.some(({ name }) => name === canonicalName)) {
      violations.push(
        violation(
          filePath,
          "notes-app-canonical-component-name",
          `${fileName} must declare its canonical component as ${canonicalName}.`
        )
      );
    }
  }

  return violations;
}

function checkComponentSlots(filePath, fileName, content) {
  if (NON_VISUAL_FILES.has(fileName)) {
    return [];
  }

  const missing = getComponentFunctionEntries(content)
    .filter(({ source }) => !/data-slot=["'][^"']+["']/.test(source))
    .map(({ name }) => name);

  if (missing.length === 0) {
    return [];
  }

  return [
    violation(
      filePath,
      "notes-app-component-data-slot",
      `${fileName} must give every visual component a data-slot; missing: ${missing.join(", ")}.`
    ),
  ];
}

function checkFile(filePath, content) {
  const fileName = path.basename(filePath);
  if (!fileName.endsWith(".tsx") || fileName.endsWith(".test.tsx")) {
    return [];
  }

  const violations = [];
  const isNonVisual = NON_VISUAL_FILES.has(fileName);

  if (!isNonVisual && !content.includes('from "@/components/ui/')) {
    violations.push(
      violation(
        filePath,
        "notes-app-requires-ui",
        "Visual notes-app components must compose a primitive from src/components/ui."
      )
    );
  }

  if (!isNonVisual) {
    const rawInteractiveElement = content.match(
      /<(button|input|select|textarea|label)(?:\s|>)/
    );
    if (rawInteractiveElement) {
      violations.push(
        violation(
          filePath,
          "notes-app-no-raw-controls",
          `Use the matching shadcn/Base UI primitive instead of raw <${rawInteractiveElement[1]}> markup.`
        )
      );
    }
  }

  violations.push(...checkDedicatedHookOwnsState(filePath, fileName, content));
  violations.push(...checkSpaceShellContract(filePath, fileName, content));
  violations.push(...checkRawLayoutWrappers(filePath, fileName, content));
  violations.push(...checkNativeSelectUsage(filePath, fileName, content));
  violations.push(...checkFieldDescriptionNesting(filePath, fileName, content));
  violations.push(...checkPrimitiveRoleAlignment(filePath, fileName, content));
  violations.push(...checkComponentRoleNames(filePath, fileName, content));
  violations.push(...checkComponentSlots(filePath, fileName, content));

  const openingTagPattern = /<[A-Za-z][\w.]*(?:\s|\n)[\s\S]*?>/g;
  for (const match of content.matchAll(openingTagPattern)) {
    const tag = match[0];
    const spreadIndex = tag.indexOf("{...props}");
    const classNameIndex = tag.indexOf("className=");
    if (
      spreadIndex !== -1 &&
      classNameIndex !== -1 &&
      classNameIndex < spreadIndex
    ) {
      violations.push(
        violation(
          filePath,
          "notes-app-props-before-layout",
          "Spread component props before the wrapper className so the canonical layout cannot be overwritten."
        )
      );
      break;
    }
  }

  return violations;
}

export {
  NON_VISUAL_FILES,
  COMPONENT_ROLE_SUFFIXES,
  COMPONENT_NAME_EXEMPTIONS,
  CANONICAL_COMPONENT_EXEMPT_FILES,
  checkDedicatedHookOwnsState,
  checkSpaceShellContract,
  checkNativeSelectUsage,
  checkFieldDescriptionNesting,
  checkPrimitiveRoleAlignment,
  checkComponentRoleNames,
  checkComponentSlots,
  checkFile,
};

export function runGuard() {
  return listApplicationComponentFiles(root)
    .filter((fullPath) => !fullPath.endsWith(".test.tsx"))
    .flatMap((fullPath) => checkFile(fullPath, readFileSync(fullPath, "utf8")));
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const violations = runGuard();
  if (violations.length > 0) {
    console.error(
      `guard-notes-app-pattern: ${violations.length} violation(s) found:`
    );
    for (const item of violations) {
      console.error(`  ${item.file} [${item.rule}] ${item.message}`);
    }
    process.exit(1);
  }

  console.log(
    "guard-notes-app-pattern: application components use simple domain surfaces over shared UI primitives."
  );
}
