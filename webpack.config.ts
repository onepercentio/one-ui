import { join, resolve } from "path";
import { Configuration, ProvidePlugin } from "webpack";
const ReactDocgenTypescriptPlugin =
  require("react-docgen-typescript-plugin").default;

process.env.NODE_ENV = "development";
process.env.DEBUG = "docgen*";
process.env.FAST_REFRESH = "false";
const configFactory =
  require("@muritavo/webpack-microfrontend-scripts/bin/react/scripts/_webpackConfiguration").createBaseConfiguration;
const baseConfig: Configuration = configFactory(
  __dirname,
  process.env.NODE_ENV
);

baseConfig.output!.libraryTarget = "umd";
baseConfig.plugins = baseConfig.plugins!.filter(
  (a) =>
    ![
      "ReactRefreshPlugin",
      "ModuleFederationPlugin",
      "SourceMapDevToolPlugin",
    ].includes(a.constructor.name)
);
const plugins = (baseConfig as any).module.rules[0].use.options
  .plugins as string[];
plugins.shift();
delete baseConfig.entry;

baseConfig.module!.rules![0] = {
  test: /\.m?[j|t]sx?$/,
  exclude: /node_modules/,
  use: {
    loader: "esbuild-loader",
    options: {
      target: "es2015",
    },
  },
};

// console.log()
// process.exit(0)
baseConfig.module!.rules!.push(
  {
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  },
  {
    test: /\.svg$/i,
    use: [
      {
        loader: "babel-loader",
        options: {
          // Allow customization from babelrc from the application folder
          babelrcRoots: ["./"],
          presets: [
            ["@babel/preset-env", { targets: "defaults" }],
            [
              "@babel/preset-react",
              {
                runtime: "automatic",
              },
            ],
            ["@babel/preset-typescript"],
          ],
          sourceType: "unambiguous",
        },
      },
      require.resolve(
        "@muritavo/webpack-microfrontend-scripts/bin/shared/loaders/ImageResolutionOptimizer/namedSVG"
      ),
      {
        loader: require.resolve("@svgr/webpack"),
        options: {
          exportType: "named",
          babel: false,
        },
      },
      require.resolve(
        "@muritavo/webpack-microfrontend-scripts/bin/shared/loaders/ImageResolutionOptimizer/extractImages"
      ),
    ],
    issuer: {
      and: [/\.(scss)$/],
    },
  }
);
baseConfig.plugins.push(
  new ReactDocgenTypescriptPlugin({
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: function (prop) {
      return prop.parent ? !/node_modules/.test(prop.parent.fileName) : true;
    },
    // NOTE: this default cannot be changed
    savePropValueAsString: true,
  })
);
export default baseConfig;
