import React, { PropsWithChildren } from "react";
import Styles from "./LinkToId.module.scss";
import { FromOnePercentUtility } from "../../type-utils";

export function scrollToId(
  id: FromOnePercentUtility<'PageSections'>,
  shouldScrollToCenter: boolean = false
) {
  const el = document.getElementById(id);

  if (el) {
    const elStyles = window.getComputedStyle(el);
    const padding = Number(elStyles.paddingTop.replace(/[^0-9]+/g, ""));
    const elementPosition = el.offsetTop;
    const elementHeight = el.clientHeight;

    window.scrollTo({
      behavior: "smooth",
      //Go to element, scroll half the screen height scrollback half the element height
      top: shouldScrollToCenter
        ? elementPosition + elementHeight / 2 - window.innerHeight / 2
        : elementPosition + padding,
    });
  }
}

/**
 * This component creates an interactive element that, when clicked, either scrolls to a section on the page or opens a link in a new tab.
 **/
export default function LinkToId({
  children,
  id,
  link,
  scrollToCenter = false,
}: PropsWithChildren<{
  id?: FromOnePercentUtility<'PageSections'>;
  link?: string;
  scrollToCenter?: boolean;
}>) {
  return link ? (
    <span className={Styles.root} onClick={() => window.open(link, "_blank")}>
      {children}
    </span>
  ) : (
    <span
      className={Styles.root}
      onClick={() => scrollToId(id!, scrollToCenter)}
    >
      {children}
    </span>
  );
}