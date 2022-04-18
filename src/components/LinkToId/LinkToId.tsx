import React, { PropsWithChildren } from "react";
import Styles from "./LinkToId.module.scss";

export function scrollToId(
  id: OnepercentUtility.PageSections,
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
 * This component creates an iteractive element and on click, routes to the specified id
 **/
export default function LinkToId({
  children,
  id,
  link,
  scrollToCenter = false,
}: PropsWithChildren<{
  id?: OnepercentUtility.PageSections;
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
