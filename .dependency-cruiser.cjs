/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment: "Circular dependencies obscure module initialization order.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "components-must-not-depend-on-routes",
      comment: "Shared components must not import App Router route modules.",
      severity: "error",
      from: { path: "^src/components" },
      to: { path: "^src/app" },
    },
    {
      name: "lib-must-remain-framework-independent",
      comment:
        "Framework-independent utilities must not depend on UI or routes.",
      severity: "error",
      from: { path: "^src/lib" },
      to: { path: "^src/(app|components|hooks|i18n)" },
    },
  ],
  options: {
    doNotFollow: { path: "(^node_modules|^\\.next)" },
    exclude: { path: "(^node_modules|^\\.next|\\.test\\.[cm]?[jt]sx?$)" },
    tsConfig: { fileName: "tsconfig.json" },
  },
};
