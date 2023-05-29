/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  roots: ["src", "WebpackConfigs"],
  moduleNameMapper: {
    "\\.(scss|less)$": "identity-obj-proxy"
  }
};