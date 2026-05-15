const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: path.resolve(__dirname, "src/index.ts"),
  externals: {
    react: "React",
    "monaco-editor": "monacoLib"
  },
  output: {
    filename: "bundle.js",
    chunkFilename: "bundle.js",
    path: path.resolve(__dirname, "dist-browser"),
    library: {
      name: "OneUI",
      type: "umd",
    },
    globalObject: "this",
    clean: true,
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: "defaults",
                },
              ],
              [
                "@babel/preset-react",
                {
                  runtime: "classic",
                },
              ],
              ["@babel/preset-typescript"],
            ],
          },
        },
      },
      {
        test: /\.svg$/i,
        type: "asset/inline",
      },
      {
        test: /\.module\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]__[hash:base64:5]",
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.scss$/,
        exclude: /\.module\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
};