import type { KnipConfig } from "knip";

// Analyze real CSS imports and pnpm-exec tools declared by the MCP configuration.
// These inputs are dependency entrypoints, not exclusions from source analysis.
const config: KnipConfig = {
  entry: [
    "src/app/{page,layout,loading,error,not-found,route}.{ts,tsx}",
    "src/components/{ui,ai-elements}/**/*.{ts,tsx}",
    "src/**/*.stories.{ts,tsx}",
    "src/app/globals.css",
    ".agents/agents.json",
  ],
  project: ["src/**/*.{ts,tsx,css}"],
  compilers: {
    css: (text) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
    json: (text) => {
      const input = JSON.parse(text);
      const servers: Record<string, { command?: string; args?: string[] }> =
        input.mcp?.servers ?? {};
      return Object.values(servers)
        .filter(
          (server) => server.command === "pnpm" && server.args?.[0] === "exec",
        )
        .map((server) => `import ${JSON.stringify(server.args?.[1])};`)
        .join("\n");
    },
  },
  // Required host tools are installed and executed by the security/infra jobs.
  // They are not npm dependencies; source files remain in the analysis graph.
  ignoreBinaries: [
    "terraform",
    "semgrep",
    "gitleaks",
    "actionlint",
    "zizmor",
    "firebase",
  ],
  // The command runner is bundled with @stryker-mutator/core.
  ignoreDependencies: ["@stryker-mutator/command-runner"],
};
export default config;
