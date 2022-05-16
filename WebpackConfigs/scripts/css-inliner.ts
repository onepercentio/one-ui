function getTextNodesIn(elem: HTMLElement): ChildNode[] {
  var textNodes: ChildNode[] = [];
  if (elem) {
    for (var nodes = elem.childNodes, i = nodes.length; i--;) {
      var node = nodes[i], nodeType = node.nodeType;
      if (nodeType == 3) {
          textNodes.push(node);
      }
      else if (nodeType == 1 || nodeType == 9 || nodeType == 11) {
        textNodes = textNodes.concat(getTextNodesIn(node as HTMLElement));
      }
    }
  }
  return textNodes;
}

export default function inlineCSS() {
  if (process.env.NODE_ENV === "development") return;
  const allEls = Array.from(document.querySelectorAll("*")) as HTMLElement[];
  const elstyles: [HTMLElement, string][] = [];

  // First read the styles of each element
  allEls.forEach((el) => {
    const styles = window.getComputedStyle(el);

    const inlined = Array.from(styles)
      .map((k) => `${k}: ${styles.getPropertyValue(k)}`)
      .join("; ")
      .concat(";");
    if (inlined !== ";") elstyles.push([el, inlined]);
  });

  // Then write it to the styles, so the update of previous elements does not affect the generation
  elstyles.forEach(([el, s]) => {
    el.setAttribute("style", s);
  });

  getTextNodesIn(document.body).forEach(n => {
    n.replaceWith(...n.textContent
      .split(/\n/g)
      .reduce((r, txt, i, arr) => 
        (arr.length - 1 === i )
          ? [...r, txt] 
          : [...r, txt, document.createElement("br")], 
      [] as (Node | string)[])
    );
  })

  if (process.env.NODE_ENV !== "test")
    document.querySelectorAll("style").forEach((e) => e.remove());
}
