/** @type {import("@ladle/react").UserConfig} */
export default {
  stories: "src/**/*.stories.{js,jsx,ts,tsx,mdx}",

  expandStoryTree: true,

  addons: {
    a11y: {
      enabled: true,
    },

    source: {
      enabled: true,
      defaultState: false,
    },

    theme: {
      enabled: true,
      defaultState: "light",
    },

    width: {
      enabled: true,
      defaultState: 0,
    },
  },
};
