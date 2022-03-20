module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/preset-scss",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
  ],
  framework: "@storybook/react",
  core: {
    builder: "webpack5",
  },
  webpackFinal: (config) => {
    config.resolve.fallback = {
      fs: false,
      zlib: false,
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/index"),
      crypto: require.resolve("crypto-browserify"),
      http: require.resolve("stream-http"),
      url: require.resolve("url/url"),
      https: require.resolve("https-browserify"),
      assert: require.resolve("assert/build/assert"),
      os: require.resolve("os-browserify/browser"),
    };

    return config;
  },
};
