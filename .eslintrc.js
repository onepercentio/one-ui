module.exports = {
  plugins: ["eslint-plugin-import-helpers"],
  parser: "@babel/eslint-parser",
  rules: {
    "import-helpers/order-imports": [
      "error",
      { groups: ["module", "/^@onepercent/", ["parent", "sibling", "index"]] },
    ],
  },
};
