export default {
  plugins: [
    "@stryker-mutator/vitest-runner",
    "@stryker-mutator/typescript-checker",
  ],
  testRunner: "vitest",
  vitest: {
    configFile: "vitest.config.ts",
  },
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  coverageAnalysis: "perTest",
  mutate: ["src/lib/utils.ts"],
  reporters: ["clear-text", "progress"],
};
