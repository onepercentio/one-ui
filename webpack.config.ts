import { join, resolve } from "path";
import { Configuration } from "webpack";
const ReactDocgenTypescriptPlugin = require("react-docgen-typescript-plugin").default;

process.env.NODE_ENV = "development"
process.env.DEBUG = "docgen*"
process.env.FAST_REFRESH = "false"
const configFactory = require("react-scripts/config/webpack.config")
const baseConfig: Configuration = configFactory(process.env.NODE_ENV);
baseConfig.resolve!.fallback = {
    path: require.resolve("path-browserify")
};
(baseConfig as any).module.rules[1].oneOf[3].include = [(baseConfig as any).module.rules[1].oneOf[3].include, resolve(join(__dirname, "cypress"))] as string[];
(baseConfig as any).plugins.push(new ReactDocgenTypescriptPlugin({
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: function (prop) {
        return prop.parent ? !/node_modules/.test(prop.parent.fileName) : true;
    },
    // NOTE: this default cannot be changed
    savePropValueAsString: true
}))
export default baseConfig;