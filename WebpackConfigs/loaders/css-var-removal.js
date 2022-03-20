/**
 * This loader works by removing the var calls by it's default value so they can be used on the email generation templates
 */

var allVarsContent = {};

const extractVars = (cssContent) => {
  let postProcessVars = {};
  const cssVarDefRegex = /--([-a-zA-Z]+):([^;]+);/g;
  let value = null;
  do {
    value = cssVarDefRegex.exec(cssContent);
    if (value) {
      const [_, varName, _varValue] = value;
      const varValue = _varValue.trim();

      if (varValue.startsWith("var(")) {
        const [_, varNameDep] = /var\(([-a-zA-Z]+)/.exec(varValue);
        postProcessVars[`--${varName}`] = varNameDep;
      } else {
        allVarsContent[`--${varName}`] = varValue.trim();
      }
    }
  } while (value !== null);

  Object.entries(postProcessVars).forEach(([varName, varNameDep]) => {
    if (allVarsContent[varNameDep])
      allVarsContent[varName] = allVarsContent[varNameDep];
  });

  return allVarsContent;
};

module.exports = (cssContent) => {
  extractVars(cssContent);
  return cssContent.replace(
    /var\(([-a-zA-Z]+), ([^\)]+)\)/g,
    (_, varName, defaultValue) => {
      return allVarsContent[varName] || defaultValue;
    }
  );
};

module.exports.extractVars = extractVars;
