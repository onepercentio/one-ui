import { defineConfig } from "cypress";
import setup from "@muritavo/cypress-toolkit/dist/scripts/config";
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
      framework: "react",
      bundler: "webpack",
    },
    defaultCommandTimeout: 15000,
    blockHosts: ['*.com'],
    setupNodeEvents(on, config) {
      setup(on, config)
      return config
    },
    viewportHeight: 1080,
    viewportWidth: 1920,
    specPattern: './cypress/**/*.test.tsx',
  },
});
