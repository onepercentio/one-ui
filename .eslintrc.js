module.exports = {
  rules: {
    "import-helpers/order-imports": [
      "error",
      { groups: ["module", "/^@onepercent/", ["parent", "sibling", "index"]] },
    ],
  },
};
