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

  if (process.env.NODE_ENV !== "test")
    document.querySelectorAll("style").forEach((e) => e.remove());
}
