import path from "node:path";

/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: "src/**/*.stories.{ts,tsx}",
  outDir: "reports/ladle",
  viteConfig: path.join(process.cwd(), ".ladle", "vite.config.mjs"),
  expandStoryTree: true,
  addons: {
    a11y: {
      enabled: true,
    },
    source: {
      enabled: true,
      defaultState: false,
    },
    width: {
      enabled: true,
      defaultState: 0,
    },
  },
};
