import {
  defineRule,
  registerDiagnostic,
  semantic,
} from "@biomejs/runtime/plugin";

// Biome 2.6 developer-preview pilot: check exported *function* components.
// Keep the mature TypeScript AST guard for missing root exports, re-exports,
// aliasing, props forwarding, and compositional cross-file contracts.
function componentNameFromPath(path) {
  const basename = path.replaceAll("\\", "/").split("/").at(-1);
  if (!basename?.endsWith(".tsx")) return null;
  const stem = basename.slice(0, -4);
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(stem)) return null;
  return stem
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

export const matchComponentFilename = defineRule({
  query: semantic("JS_IDENTIFIER_BINDING"),
  run(node, ctx) {
    const root = componentNameFromPath(ctx.filePath);
    if (!root) return;

    const binding = ctx.model.asBinding(node);
    if (binding?.declarationKind() !== "function" || !binding.isExported()) {
      return;
    }

    const name = node.text;
    if (!/^[A-Z]/.test(name)) return;
    if (
      name === root ||
      (name.startsWith(root) && /^[A-Z]/.test(name.slice(root.length)))
    ) {
      return;
    }

    registerDiagnostic(
      node,
      "error",
      `Exported component "${name}" does not match filename; expected "${root}" or a "${root}*" compound part.`,
    );
  },
});
