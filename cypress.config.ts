import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
  },

  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
    defaultCommandTimeout: 15000,
    blockHosts: ['*.com'],
    setupNodeEvents(on, config) { },
    viewportHeight: 1080,
    viewportWidth: 1920,
    specPattern: './cypress/**/*.test.tsx',
  },
});
