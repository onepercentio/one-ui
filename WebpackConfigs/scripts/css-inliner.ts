export const extractVars = (
  varOrDefault: string,
  storeVarsAt: string[]
): string | undefined => {
  const varColorParts = /var\(([a-z0-9A-Z-]+)([^)]*)\)?/.exec(varOrDefault);
  if (varColorParts) {
    storeVarsAt.push(varColorParts[1]);
    return extractVars(varColorParts[2], storeVarsAt);
  } else {
    if (storeVarsAt.length && varOrDefault.length)
      return varOrDefault.replace(/^,/g, "").trim();
  }
};

export function parseVarColor(
  color: string,
  startingAt: HTMLElement
): string | undefined {
  const varsToCheckFor: string[] = [];
  let defaultColor = extractVars(color, varsToCheckFor);
  if (varsToCheckFor.length) {
    let elToCheckForVar: HTMLElement | null = startingAt;
    while (elToCheckForVar) {
      const styles = window.getComputedStyle(elToCheckForVar);
      for (const varName of varsToCheckFor) {
        const varColor = styles.getPropertyValue(varName);
        if (varColor) {
          return parseVarColor(varColor, startingAt) || varColor;
        }
      }
      elToCheckForVar = elToCheckForVar.parentElement;
    }
    if (defaultColor) return defaultColor;
  }
}

function getTextNodesIn(elem: HTMLElement): ChildNode[] {
  var textNodes: ChildNode[] = [];
  if (elem) {
    for (var nodes = elem.childNodes, i = nodes.length; i--; ) {
      var node = nodes[i],
        nodeType = node.nodeType;
      if (nodeType == 3) {
        textNodes.push(node);
      } else if (nodeType == 1 || nodeType == 9 || nodeType == 11) {
        textNodes = textNodes.concat(getTextNodesIn(node as HTMLElement));
      }
    }
  }
  return textNodes;
}

export default function inlineCSS(force: boolean = false) {
  if (process.env.NODE_ENV === "development" && force === false) return;
  const allEls = Array.from(document.querySelectorAll("*")) as HTMLElement[];
  const elstyles: [HTMLElement, string][] = [];

  // First read the styles of each element
  allEls.forEach((el) => {
    const styles = window.getComputedStyle(el) as CSSStyleDeclaration & {
      _values: CSSStyleDeclaration;
    };

    if (el.getAttribute("data-debug")) {
      console.log(styles);
    }

    for (let key in styles._values) {
      const replacementColor = parseVarColor(styles[key], el);
      if (replacementColor) styles.setProperty(key, replacementColor);
    }

    const inlined = Array.from(styles)
      .map((k) => {
        return `${k}: ${styles.getPropertyValue(k)}`
      })
      .join("; ")
      .concat(";");
    if (inlined !== ";") elstyles.push([el, inlined]);
  });

  // Then write it to the styles, so the update of previous elements does not affect the generation
  elstyles.forEach(([el, s]) => {
    el.setAttribute("style", s);
  });

  if (force === false)
    getTextNodesIn(document.body).forEach((n) => {
      n.replaceWith(
        ...n.textContent!.split(/\n/g).reduce((r, txt, i, arr) => {
          return arr.length - 1 === i
            ? [...r, txt]
            : [...r, txt, document.createElement("br")];
        }, [] as (Node | string)[])
      );
    });

  if (process.env.NODE_ENV !== "test")
    document.querySelectorAll("style").forEach((e) => e.remove());
}
