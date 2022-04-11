const { getOptions } = require("loader-utils");

module.exports = function (content) {
  const {
    features: { inlineCSS },
  } = getOptions(this);
  content = content.replace("export default ", "");
  const [_, functionName] = /function ([a-zA-Z]+)\(/.exec(content);
  content = `import { render } from 'react-dom';
import React from 'react';
import InlineCSS from "CSSInliner";
window.PRERENDER = window.PRERENDER || true

${content}
export default function Load() {
return new Promise((r) => {
    render(<${functionName}/>, document.body);
    ${inlineCSS ? `InlineCSS();` : ""}
    r();
})
}

  ${process.env.NODE_ENV === "development" ? "Load()" : ""}`;

  return content;
};
