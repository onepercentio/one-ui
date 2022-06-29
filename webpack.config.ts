import { join, resolve } from "path";
const ReactDocgenTypescriptPlugin = require("react-docgen-typescript-plugin").default;

process.env.NODE_ENV = "development"
process.env.DEBUG = "docgen*"
const configFactory = require("react-scripts/config/webpack.config")
const baseConfig = configFactory(process.env.NODE_ENV);
baseConfig.module.rules[1].oneOf[3].include = [baseConfig.module.rules[1].oneOf[3].include, resolve(join(__dirname, "cypress"))] as string[];
baseConfig.plugins.push(new ReactDocgenTypescriptPlugin({
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: function (prop) {
        return prop.parent ? !/node_modules/.test(prop.parent.fileName) : true;
    },
    // NOTE: this default cannot be changed
    savePropValueAsString: true
}))
export default baseConfig;