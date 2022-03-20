process.env.NODE_ENV =
  process.env.NODE_ENV ||
  (process.env.npm_lifecycle_event.includes("start")
    ? "development"
    : "production");
const Module = require("module").Module;
function resolveFromMainContext(module) {
  return Module._resolveFilename(module, require.main);
}
const { join, relative, resolve } = require("path");
const HTMLPlugin = require("html-webpack-plugin");

function findAllStaticGeneration() {
  const glob = require("glob");
  const results = glob.sync("**/*.static.tsx", {
    cwd: join(resolve("."), "src"),
    absolute: true,
  });

  return results;
}

function parseResultsrToEntries(results) {
  return results.reduce((entries, filePath) => {
    const [_, fileName] = /[\\/]([^\\/]+).static.tsx/.exec(filePath);
    entries[fileName] = filePath;
    return entries;
  }, {});
}

const configGenerator = require.main.require(
  "@muritavo/webpack-microfrontend-scripts/bin/react/scripts/_webpackConfiguration"
).createBaseConfiguration;

const baseConfig = configGenerator(resolve("."), process.env.NODE_ENV);

const results = findAllStaticGeneration();
const entries = parseResultsrToEntries(results);

baseConfig.entry = entries;
if (process.env.NODE_ENV === "production") {
  baseConfig.output.path = join(resolve("."), "build", "templates");
  baseConfig.output.publicPath =
    (process.env.EMAIL_TEMPLATES_BASE_DOMAIN || "") + "/templates/";
}

baseConfig.output.libraryTarget = "umd";
baseConfig.plugins = baseConfig.plugins.filter(
  (a) =>
    !["ManifestPlugin", "MiniCss"].find((pattern) =>
      a.constructor.name.includes(pattern)
    )
);
const babelLoader = baseConfig.module.rules[0].use;
baseConfig.module.rules.splice(1, 0, {
  test: /\.static\.tsx/,
  use: [
    {
      loader: babelLoader.loader,
      options: babelLoader.options,
    },
    join(__dirname, "loaders", "static-loader"),
  ],
});
const entryKeys = Object.keys(baseConfig.entry);
baseConfig.module.rules.unshift({
  test: /\.svg$/,
  use: [
    {
      loader: require.resolve(join(__dirname, "loaders", "svg-to-png.js")),
      options: {
        name: "static/media/[name].png",
        resizeFactor: 10,
      },
    },
  ],
});
entryKeys.map((i) => {
  baseConfig.plugins.push(
    new HTMLPlugin({
      minify: false,
      template:
        process.env.NODE_ENV === "development"
          ? join(resolve("."), "public", "index.html")
          : `!!${resolveFromMainContext(
              "@nettoolkit/prerender-loader"
            )}?string&entry=${relative(
              resolve("."),
              baseConfig.entry[i]
            )}!${join(resolve("."), "public", "index.html")}`,
      inject: process.env.NODE_ENV === "development",
      filename:
        process.env.NODE_ENV === "development"
          ? `${i}.html`
          : `../../templates/${i}.html`,
      excludeChunks: entryKeys
        .filter((a) => a !== i)
        .map((a) => {
          return `${a}`;
        }),
      version: 5,
    })
  );
});

if (process.env.NODE_ENV === "production") {
  const allLoadersThatContainMiniCSS = baseConfig.module.rules.filter((a) => {
    return (
      Array.isArray(a.use) &&
      a.use.find((a) => (a.loader || a).includes("mini-css"))
    );
  });

  allLoadersThatContainMiniCSS.forEach((l) => {
    l.use[0] = require.resolve("style-loader");
    l.use.splice(1, 0, join(__dirname, "loaders", "css-var-removal.js"));
  });
}

if (!baseConfig.resolve.alias) baseConfig.resolve.alias = {};
baseConfig.resolve.alias.CSSInliner = require.resolve(
  join(__dirname, "scripts", "css-inliner.ts")
);

baseConfig.output.filename = `[name].js`;

if (!baseConfig.optimization) baseConfig.optimization = {};
baseConfig.optimization.runtimeChunk = false;

baseConfig.plugins = baseConfig.plugins.filter(
  (a) => a.constructor.name !== "ModuleFederationPlugin"
);
baseConfig.plugins.splice(0, 1);

module.exports = baseConfig;
