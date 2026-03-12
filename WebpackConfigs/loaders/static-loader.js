const { getOptions } = require("loader-utils");

module.exports = function (content) {
  const {
    features: { inlineCSS },
  } = getOptions(this);
  content = content.replace("export default ", "");
  const [_, functionName] = /function ([a-zA-Z0-9]+)\(/.exec(content);
  content = `import * as DOM from 'react-dom';
import * as ClientDOM from 'react-dom/client';
import React from 'react';
import InlineCSS from "CSSInliner";
window.PRERENDER = window.PRERENDER || true
const { render } = DOM;
const { createRoot } = ClientDOM;
${content}
export default function Load() {
return new Promise((r) => {
    if (!!createRoot) {
      createRoot(document.body).render(<${functionName}/>)
    } else {
      render(<${functionName}/>, document.body);  
    }
    
    ${inlineCSS ? `InlineCSS();` : ""}
    r();
})
}

  ${process.env.NODE_ENV === "development" ? "Load()" : ""}`;

  return content;
};
