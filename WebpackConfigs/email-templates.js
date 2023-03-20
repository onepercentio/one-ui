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
const HTMLPlugin = require.main.require("html-webpack-plugin");
const {
  writeFileSync,
  readdirSync,
  lstatSync,
  rmSync,
  existsSync,
  mkdirSync,
} = require("fs");
const lodash = require("lodash");
const { findPathDeep } = require("deepdash")(lodash);
const chalk = require("chalk");

function findAllStaticGeneration() {
  const glob = require("glob");
  const results = glob.sync("**/*.+(static|email).tsx", {
    cwd: join(resolve("."), "src"),
    absolute: true,
  });

  return results;
}

function parseResultsrToEntries(results) {
  return results.reduce((entries, filePath) => {
    const [_, fileName] = /[\\/]([^\\/]+).(static|email).tsx/.exec(filePath);
    entries[fileName] = filePath;
    return entries;
  }, {});
}

let configGenerator;
async function loadGenerator() {
  try {
    configGenerator = require(resolve("./webpack-email-config-factory"));
    return configGenerator(resolve("."), process.env.NODE_ENV);
  } catch (e) {
    switch (e.code) {
      case "MODULE_NOT_FOUND":
        if (e.message.split("\n")[0].includes("config-factory")) {
          const ans = await require("inquirer").prompt([
            {
              type: "confirm",
              message:
                "The email webpack config factory was not found. Would you like to create the file?",
              name: "createFactory",
              default: false,
            },
          ]);
          if (ans.createFactory) {
            writeFileSync(
              "./webpack-email-config-factory.js",
              `module.exports = function webpackConfigFactory(pathToRoot, environment) {
  const config = /** Here you place the function that will create the base webpack config */;
  const mainHtml = /** Here you place the path to the base html file or an array in the format [HTML_PATH, NAME_TO_SAVE_AS][] */
  return {
    config,
    mainHtml
  }
}`
            );
            console.log(require("chalk").green("File created"));
          } else {
            console.log(
              require("chalk").yellow(
                "This command will only work when there is a valid configuration"
              )
            );
          }
          process.exit(0);
        }
      default:
        console.warn("An unexpected error has ocurred:", e);
        process.exit(1);
    }
  }
}

function findFirstBabelLoaderConfigPath(config) {
  const path = findPathDeep(config.module.rules, (v, k, par) => {
    if (k === "loader" && typeof v === "string" && v.includes("babel-loader"))
      return par;
  });
  return path.replace(".loader", "");
}

function prerenderRequire() {
  try {
    return resolveFromMainContext(
      "@nettoolkit/prerender-loader" // This supports webpack 5
    );
  } catch (e) {
    return resolveFromMainContext(
      "prerender-loader" // This doesn't
    );
  }
}

function createConfig(
  baseConfig,
  mainHtml = join(__dirname, "templates", "index.html"),
  features = {
    inlineCSS: true,
    replaceCSSRules: true,
  },
  outputDir = join(resolve("."), "templates")
) {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  const results = findAllStaticGeneration();
  const entries = parseResultsrToEntries(results);

  baseConfig.entry = entries;
  let resourcesPath = join(resolve("."), "build", "templates");
  if (process.env.NODE_ENV === "production") {
    const outputFolderFiles = readdirSync(outputDir);
    const onlyHTMLs = !outputFolderFiles.some(
      (file) =>
        lstatSync(join(outputDir, file)).isDirectory() ||
        !file.endsWith(".html")
    );
    if (onlyHTMLs) {
      rmSync(outputDir, {
        recursive: true,
      });
    }
    baseConfig.output.path = resourcesPath;
    baseConfig.output.publicPath =
      (process.env.EMAIL_TEMPLATES_BASE_DOMAIN || "") + "/templates/";
  } else {
    baseConfig.output.publicPath = "/";
  }

  baseConfig.output.libraryTarget = "umd";
  baseConfig.plugins = baseConfig.plugins.filter(
    (a) =>
      !["ManifestPlugin", "MiniCss"].find((pattern) =>
        a.constructor.name.includes(pattern)
      )
  );
  /** @type {import("webpack").WebpackPluginInstance} */
  const LogPlugin = {
    apply(compiler) {
      let warned = {};
      compiler.hooks.afterEmit.tap("Logger", (compilation) => {
        console.log(chalk.green("Output successfull"));
        const htmls = Object.keys(compilation.assets).filter((a) =>
          a.endsWith(".html")
        );
        const lazyFindPort = process.argv.find((a) => a === "--port");
        const port = process.argv[process.argv.indexOf(lazyFindPort) + 1];
        for (let htmlPath of htmls) {
          if (warned[htmlPath]) return;
          warned[htmlPath] = true;
          console.log(`Template ${htmlPath.replace(".html", "")}:`);
          console.log(chalk.green(`\thttp://localhost:${port}/${htmlPath}\n`));
        }
      });
    },
  };
  baseConfig.plugins.push(LogPlugin);
  const babelLoaderPath = findFirstBabelLoaderConfigPath(baseConfig);
  const babelLoader = lodash.get(baseConfig.module.rules, babelLoaderPath);
  const indexOfOneOf = babelLoaderPath.indexOf("oneOf");
  const whereToPlaceTheNewLoaderPath =
    indexOfOneOf === -1
      ? baseConfig.module.rules
      : lodash.get(
          baseConfig.module.rules,
          babelLoaderPath.slice(0, indexOfOneOf + 5)
        );

  whereToPlaceTheNewLoaderPath.splice(1, 0, {
    test: /\.static\.tsx/,
    use: [
      {
        loader: babelLoader.loader,
        options: babelLoader.options,
      },
      {
        loader: join(__dirname, "loaders", "static-loader"),
        options: {
          features,
        },
      },
    ],
  });

  whereToPlaceTheNewLoaderPath.splice(1, 0, {
    test: /\.email\.tsx/,
    use: [
      {
        loader: babelLoader.loader,
        options: babelLoader.options,
      },
      {
        loader: join(__dirname, "loaders", "static-loader"),
        options: {
          features: {
            ...features,
            inlineCSS: true,
          },
        },
      },
    ],
  });
  const entryKeys = Object.keys(baseConfig.entry);
  if (features.replaceCSSRules)
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
    const htmlEntries = [];
    function HTMLPluginEntry(htmlFilePath, suffix) {
      return new HTMLPlugin({
        minify: false,
        template:
          process.env.NODE_ENV === "development"
            ? htmlFilePath
            : `!!${prerenderRequire()}?${JSON.stringify({
                string: true,
                documentUrl: `http://localhost/${i}.html`,
                entry: relative(resolve("."), baseConfig.entry[i]),
              })}!${htmlFilePath}`,
        inject: process.env.NODE_ENV === "development",
        filename:
          process.env.NODE_ENV === "development"
            ? `${i}${suffix}.html`
            : `${relative(resourcesPath, outputDir)}/${i}${suffix}.html`,
        excludeChunks: entryKeys
          .filter((a) => a !== i)
          .map((a) => {
            return `${a}`;
          }),
        version: 5,
      });
    }
    if (typeof mainHtml === "string")
      htmlEntries.push(HTMLPluginEntry(mainHtml, ""));
    else
      for (let [htmlFilePath, subfileName] of mainHtml)
        htmlEntries.push(HTMLPluginEntry(htmlFilePath, `/${subfileName}`));

    baseConfig.plugins.push(...htmlEntries);
  });

  function replaceMiniCSSLoaders(rulesSet) {
    const allLoadersThatContainMiniCSS = rulesSet.filter((a) => {
      return (
        Array.isArray(a.use) &&
        a.use.find((a) => (a.loader || a).includes("mini-css"))
      );
    });

    allLoadersThatContainMiniCSS.forEach((l) => {
      l.use[0] = {
        loader: require.resolve("style-loader"),
        options: {},
      };
      l.use.splice(1, 0, join(__dirname, "loaders", "css-var-removal.js"));
    });
  }
  if (process.env.NODE_ENV === "production") {
    const baseRules = baseConfig.module.rules;
    replaceMiniCSSLoaders(baseRules);
    for (let rule of baseRules) {
      if ("oneOf" in rule) {
        replaceMiniCSSLoaders(rule.oneOf);
      }
    }
  }

  if (!baseConfig.resolve.alias) baseConfig.resolve.alias = {};
  baseConfig.resolve.alias.CSSInliner = require.resolve(
    join(__dirname, "scripts", "css-inliner.ts")
  );

  baseConfig.output.filename = `[name].js`;

  if (!baseConfig.optimization) baseConfig.optimization = {};
  baseConfig.optimization.runtimeChunk = false;

  baseConfig.plugins = baseConfig.plugins.filter(
    (a) =>
      !["ModuleFederationPlugin", "SourceMapDevToolPlugin"].includes(
        a.constructor.name
      )
  );

  const providePlugin = baseConfig.plugins.find(
    (a) => a.constructor.name === "ProvidePlugin"
  );

  if (providePlugin) delete providePlugin.definitions.process;

  return baseConfig;
}

function checkTemplatesCount(webpackEntry) {
  if (Object.keys(webpackEntry).length === 0) {
    console.log(
      chalk.green(
        `No templates were found. If you want to create a static template, please create a file with name ${chalk.white(
          "{htmlName}.static.tsx"
        )} (ex: some-template.static.tsx)`
      )
    );
    process.exit(0);
  }
}

module.exports = async function initEmailWebpack() {
  const {
    config: baseConfig,
    mainHtml,
    features,
    outputDir,
  } = await loadGenerator();
  const config = createConfig(baseConfig, mainHtml, features, outputDir);
  checkTemplatesCount(config.entry);
  return config;
};

module.exports.checkTemplatesCount = checkTemplatesCount;
