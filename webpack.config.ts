import { join, resolve } from "path";
import { Configuration, ProvidePlugin } from "webpack";
const ReactDocgenTypescriptPlugin = require("react-docgen-typescript-plugin").default;

process.env.NODE_ENV = "development"
process.env.DEBUG = "docgen*"
process.env.FAST_REFRESH = "false"
const configFactory = require("@muritavo/webpack-microfrontend-scripts/bin/react/scripts/_webpackConfiguration").createBaseConfiguration
const baseConfig: Configuration = configFactory(process.env.INIT_CWD, process.env.NODE_ENV);

baseConfig.output!.libraryTarget = "umd";
baseConfig.plugins = baseConfig.plugins!.filter(
    (a) => a.constructor.name !== "ModuleFederationPlugin"
);
// baseConfig.resolve!.alias = {
//     "node-fetch": require.resolve("./cypress/plugins/custom-fetch"),
//     child_process: require.resolve("./cypress/plugins/child_process"),
// };
baseConfig.module!.rules!.push({
    test: /\.m?js$/,
    resolve: {
        fullySpecified: false,
    },
});
// (baseConfig as any).module.rules[1].oneOf[3].include = [(baseConfig as any).module.rules[1].oneOf[3].include, resolve(join(__dirname, "cypress"))] as string[];
baseConfig.plugins.push(new ReactDocgenTypescriptPlugin({
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: function (prop) {
        return prop.parent ? !/node_modules/.test(prop.parent.fileName) : true;
    },
    // NOTE: this default cannot be changed
    savePropValueAsString: true
}));
console.warn(baseConfig.resolve?.fallback)
export default baseConfig;